"""
AISP Client — integration adapter for the BRAC AISP mobile backend.

STATUS: IMPLEMENTED
This client manages reading consultations and delivering responses to the AISP API.
See docs/integration-with-existing-aisp.md for the full integration plan.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List
import httpx


@dataclass
class AISPConsultation:
    """Represents a consultation fetched from the AISP backend."""
    aisp_reference: str
    field_worker_name: str
    field_worker_phone: str | None
    zone_erp_code: str | None
    animal_species: str
    animal_breed: str | None
    symptoms: str
    priority: str
    submitted_at: str  # ISO 8601


class AISPClient:
    """
    Adapter for the BRAC AISP REST API.
    """

    def __init__(self, base_url: str, api_key: str) -> None:
        self.base_url = base_url.rstrip("/") if base_url else ""
        self.api_key  = api_key
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def fetch_consultations(self, since_timestamp: str | None = None) -> List[AISPConsultation]:
        """
        Fetch new consultations from the AISP backend since a given timestamp.
        Expected endpoint: GET /consultations?since=<ISO8601>
        """
        if not self.base_url:
            return []

        url = f"{self.base_url}/consultations"
        params = {"since": since_timestamp} if since_timestamp else {}

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            data = response.json()
            return [AISPConsultation(**item) for item in data]

    async def deliver_response(self, aisp_reference: str, response_payload: dict) -> bool:
        """
        Deliver a doctor's response back to the AISP backend.
        Expected endpoint: POST /responses/{aisp_reference}
        Returns True if delivery succeeded.
        """
        if not self.base_url:
            return False

        url = f"{self.base_url}/responses/{aisp_reference}"

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=response_payload)
            return response.status_code == 200