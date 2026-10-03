#!/usr/bin/env python3
"""Dependency-free integrity checks for Rentora's editable listing data."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / "data" / "listings.json").read_text())
apartments = {item["id"]: item for item in data["apartments"]}
rooms = {item["id"]: item for item in data["rooms"]}
required = {
    "id", "type", "title", "description", "price", "address", "district", "coordinates",
    "area", "photos", "bathroomType", "bathrooms", "residents", "floor", "utilities",
    "nearby", "status"
}
for item in [*apartments.values(), *rooms.values()]:
    missing = required - item.keys()
    assert not missing, f"{item.get('id')}: missing {sorted(missing)}"
    assert len(item["coordinates"]) == 2, f"{item['id']}: invalid coordinates"
    assert item["type"] in {"room", "apartment"}
    assert item["status"] in {"available", "occupied"}
for room in rooms.values():
    apartment = apartments.get(room["apartmentId"])
    assert apartment, f"{room['id']}: parent apartment does not exist"
    assert room["id"] in apartment["roomIds"], f"{room['id']}: not listed by parent apartment"
for apartment in apartments.values():
    for room_id in apartment["roomIds"]:
        assert rooms.get(room_id, {}).get("apartmentId") == apartment["id"], f"{room_id}: broken apartment link"
print(f"OK: {len(apartments)} apartments, {len(rooms)} rooms, all data links valid")
