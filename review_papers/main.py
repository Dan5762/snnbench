import os
import json
import requests
from typing import Dict, List
from datetime import datetime

from openai import OpenAI


class PaperAnalyzer:
    def __init__(self, openai_key: str):
        self.openai_client = OpenAI(api_key=openai_key)
        self.categories = {
            "training_methods": ["supervised", "unsupervised", "reinforcement"],
            "architectures": ["feedforward", "recurrent", "hybrid", "deep"],
            "neuron_models": ["lif", "izhikevich", "hodgkin-huxley", "adaptive"]
        }

    def fetch_paper_details(self, paper_id: str) -> Dict:
        """Fetch paper details from Semantic Scholar API."""
        url = f"https://api.semanticscholar.org/v1/paper/{paper_id}"
        response = requests.get(url)
        return response.json()

    def analyze_relevance(self, abstract: str) -> tuple[bool, float]:
        """Use GPT to determine if paper is relevant to SNN training."""
        prompt = f"""
        Analyze if this paper abstract is relevant to training spiking neural networks.
        Abstract: {abstract}

        Return a JSON with two fields:
        - is_relevant: boolean
        - confidence: float between 0 and 1
        """

        response = self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        return result["is_relevant"], result["confidence"]

    def classify_paper(self, abstract: str) -> Dict:
        """Classify paper into categories and extract key information."""
        prompt = f"""
        Analyze this paper abstract and classify it according to SNN research:
        Abstract: {abstract}

        Return a JSON with:
        - primary_category: str (one of: training_methods, architectures, neuron_models)
        - subcategory: str
        - novel_contribution: str
        - key_methods: list[str]
        """

        response = self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)

    def analyze_citations(self, citations: List[Dict]) -> List[Dict]:
        """Analyze relevance of paper citations."""
        relevant_citations = []

        for citation in citations:
            if not citation.get("abstract"):
                continue

            is_relevant, confidence = self.analyze_relevance(citation["abstract"])

            if is_relevant and confidence > 0.8:
                classification = self.classify_paper(citation["abstract"])
                relevant_citations.append({
                    "paper_id": citation["paperId"],
                    "title": citation["title"],
                    "classification": classification,
                    "confidence": confidence
                })

        return relevant_citations

    def save_analysis(self, paper_id: str, analysis: Dict):
        """Save paper analysis to JSON file."""
        filename = f"analyses/{paper_id}.json"
        os.makedirs("analyses", exist_ok=True)

        with open(filename, "w") as f:
            json.dump(analysis, f, indent=2)

    def process_paper(self, paper_id: str):
        """Process a single paper and its citations."""
        paper = self.fetch_paper_details(paper_id)

        if not paper.get("abstract"):
            return {"error": "No abstract available"}

        is_relevant, confidence = self.analyze_relevance(paper["abstract"])

        if not is_relevant:
            return {"error": "Paper not relevant to SNN training"}

        classification = self.classify_paper(paper["abstract"])
        relevant_citations = self.analyze_citations(paper.get("citations", []))

        analysis = {
            "paper_id": paper_id,
            "title": paper["title"],
            "classification": classification,
            "relevant_citations": relevant_citations,
            "confidence": confidence,
            "analysis_date": datetime.now().isoformat()
        }

        self.save_analysis(paper_id, analysis)
        return analysis


def main():
    # Example usage
    analyzer = PaperAnalyzer(os.getenv("OPENAI_API_KEY"))

    # Process a seed paper
    paper_id = "INSERT_PAPER_ID"  # e.g., from Semantic Scholar URL
    result = analyzer.process_paper(paper_id)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
