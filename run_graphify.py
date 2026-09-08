import json
from pathlib import Path
from graphify.extract import collect_files, extract
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json, to_html

def main():
    detect_path = Path('graphify-out/.graphify_detect.json')
    detect = json.loads(detect_path.read_text(encoding='utf-8'))
    
    code_files = []
    for f in detect.get('files', {}).get('code', []):
        p = Path(f)
        code_files.extend(collect_files(p) if p.is_dir() else [p])

    print(f"Code files found: {len(code_files)}")
    ast_result = extract(code_files, cache_root=Path('.'))
    print(f"AST extracted: {len(ast_result['nodes'])} nodes, {len(ast_result['edges'])} edges")

    merged = {
        'nodes': ast_result['nodes'],
        'edges': ast_result['edges'],
        'hyperedges': [],
        'input_tokens': 0,
        'output_tokens': 0
    }
    Path('graphify-out/.graphify_extract.json').write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding='utf-8')

    G = build_from_json(merged, root='.', directed=False)
    print(f"Graph nodes: {G.number_of_nodes()}, edges: {G.number_of_edges()}")

    communities = cluster(G)
    cohesion = score_all(G, communities)
    gods = god_nodes(G)
    surprises = surprising_connections(G, communities)
    labels = {cid: f"Community {cid}" for cid in communities}
    questions = suggest_questions(G, communities, labels)

    to_json(G, communities, 'graphify-out/graph.json')
    try:
        to_html(G, communities, 'graphify-out/graph.html')
    except Exception as e:
        print(f"Notice on to_html: {e}")

    tokens = {'input': 0, 'output': 0}
    report = generate(G, communities, cohesion, labels, gods, surprises, detect, tokens, '.', suggested_questions=questions)
    Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')

    print("Graphify knowledge graph pipeline finished successfully!")

if __name__ == '__main__':
    main()
