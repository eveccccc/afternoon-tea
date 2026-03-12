import pandas as pd
import json
import os
import sys

# Force output to UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def extract_tea_data(file_path):
    # Read the excel file
    df = pd.read_excel(file_path)
    # Convert dataframe to list of dicts
    return df.fillna("").to_dict(orient="records")

if __name__ == "__main__":
    file_path = "d:/clean/Reserve/record/下午茶店家紀錄.xlsx"
    if os.path.exists(file_path):
        data = extract_tea_data(file_path)
        with open("d:/clean/Reserve/record/extracted_data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Successfully extracted data to d:/clean/Reserve/record/extracted_data.json")
    else:
        print("File not found")
