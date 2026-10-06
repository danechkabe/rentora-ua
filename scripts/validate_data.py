#!/usr/bin/env python3
"""Dependency-free integrity checks for Philip Apartment listing data."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / "data" / "listings.json").read_text())
assert {"site", "apartments", "rooms"} <= data.keys()
contact = data["site"]["contact"]
assert {"name", "phone", "phoneHref"} <= contact.keys()
apartments = {item["id"]: item for item in data["apartments"]}
rooms = {item["id"]: item for item in data["rooms"]}
room_fields = {
    "id", "type", "apartmentId", "title", "description", "status", "price", "currency", "deposit",
    "address", "coordinates", "floor", "bathroomType", "bathrooms", "utilitiesIncluded", "contract",
    "washingMachine", "fridge", "bathroomFixture", "smokingAllowed", "petsAllowed", "photos"
}
for room in rooms.values():
    missing = room_fields - room.keys()
    assert not missing, f"{room.get('id')}: missing {sorted(missing)}"
    assert room["type"] == "room"
    assert room["status"] in {"available", "upcoming", "occupied"}
    assert len(room["coordinates"]) == 2 and room["photos"], f"{room['id']}: invalid location or photos"
    if room["status"] == "upcoming":
        assert room.get("availableFrom"), f"{room['id']}: upcoming room needs availableFrom"
    apartment = apartments.get(room["apartmentId"])
    assert apartment, f"{room['id']}: parent apartment does not exist"
    assert room["id"] in apartment["roomIds"], f"{room['id']}: not listed by parent apartment"
for apartment in apartments.values():
    assert {"id", "coordinates", "bathrooms", "roomsForRent", "roomIds"} <= apartment.keys()
    assert len(apartment["coordinates"]) == 2
    assert apartment["roomsForRent"] == len(apartment["roomIds"]), f"{apartment['id']}: room count does not match IDs"
    for room_id in apartment["roomIds"]:
        assert rooms.get(room_id, {}).get("apartmentId") == apartment["id"], f"{room_id}: broken apartment link"
print(f"OK: {len(apartments)} apartment locations, {len(rooms)} rooms, Philip contact and all data links valid")
