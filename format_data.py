import json

with open('d:/clean/Reserve/record/extracted_data.json', 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

formatted_vendors = []
for i, entry in enumerate(raw_data):
    name = entry.get(' 店家', entry.get('店家', ''))
    if not isinstance(name, str): name = str(name)
    name = name.strip()
    if not name: continue
    
    formatted_vendors.append({
        "id": 2000 + i,
        "name": name,
        "phone": str(entry.get('電話', '')),
        "category": str(entry.get('分類', '未分類')),
        "notice": str(entry.get('告知時間', '')),
        "method": str(entry.get('訂購方式', '')),
        "address": str(entry.get('地址', '')),
        "notes": str(entry.get('備註', '')),
        "menu": []
    })

with open('d:/clean/Reserve/record/formatted_vendors_v2.json', 'w', encoding='utf-8') as f:
    json.dump(formatted_vendors, f, ensure_ascii=False, indent=2)

print("Saved v2 data to d:/clean/Reserve/record/formatted_vendors_v2.json")
