"""
Fact verification service using NLI
"""
from typing import Tuple

try:
    from transformers import pipeline
    import torch
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False


class FactVerifier:
    """Verify claims using Natural Language Inference"""

    def __init__(self):
        self.nli_model = None
        if HAS_TRANSFORMERS:
            try:
                self.nli_model = pipeline(
                    "text-classification",
                    model="cross-encoder/nli-deberta-v3-small",
                    device=0 if (torch.cuda.is_available() if HAS_TRANSFORMERS else False) else -1
                )
            except Exception as e:
                print(f"NLI model load failed: {e}. Using fallback.")

    def verify(self, claim: str, evidence: str) -> Tuple[str, float]:
        if not self.nli_model:
            return self._simple_verification(claim, evidence)
        try:
            result = self.nli_model(f"{evidence} [SEP] {claim}")
            label = result[0]['label'].upper()
            confidence = result[0]['score']
            if 'ENTAIL' in label or 'SUPPORT' in label:
                return "SUPPORTS", confidence
            elif 'CONTRADICT' in label or 'REFUTE' in label:
                return "REFUTES", confidence
            else:
                return "NOT_ENOUGH_INFO", confidence
        except Exception as e:
            print(f"NLI error: {e}")
            return self._simple_verification(claim, evidence)

    def _simple_verification(self, claim: str, evidence: str) -> Tuple[str, float]:
        claim_words = set(claim.lower().split())
        evidence_words = set(evidence.lower().split())

        # Remove common stop words so matching is more meaningful
        stop_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'it', 'this',
                      'that', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or'}
        claim_words = claim_words - stop_words
        evidence_words = evidence_words - stop_words

        if not claim_words or not evidence_words:
            return "SUPPORTS", 0.55

        overlap = len(claim_words & evidence_words)
        max_len = max(len(claim_words), len(evidence_words))
        similarity = overlap / max_len

        # Strong negation words in evidence = claim is being refuted
        negation_words = {'not', 'no', 'never', 'false', 'incorrect',
                          'myth', 'debunked', 'wrong', 'untrue', 'misleading'}
        has_negation = any(w in evidence_words for w in negation_words)

        # Support words in evidence = claim is being confirmed
        support_words = {'true', 'correct', 'confirmed', 'indeed', 'proven',
                         'accurate', 'verified', 'fact', 'yes'}
        has_support = any(w in evidence_words for w in support_words)

        # Lower threshold — any meaningful word overlap counts
        if similarity > 0.15:
            if has_negation:
                return "REFUTES", 0.70
            elif has_support:
                return "SUPPORTS", 0.75
            else:
                # Default: if retrieved fact is relevant, trust the database truth_value
                return "SUPPORTS", 0.60

        # Even low overlap — still make a call based on negation
        if has_negation:
            return "REFUTES", 0.55

        # Default to SUPPORTS so the database truth_value drives the final verdict
        return "SUPPORTS", 0.50


_verifier = None

def get_verifier() -> FactVerifier:
    global _verifier
    if _verifier is None:
        _verifier = FactVerifier()
    
    return _verifier
