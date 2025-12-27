import os

file_path = r"c:\Sistemas CARSOFT\Sistema de facturacion\Sistema de facturacion\administrar\templates\administrar\parametros.html"

# Read the current content
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the split template tag - find and replace the multi-line version
old_text = '''<input class="form-check-input" type="checkbox" name="habilita_remitos" {% if empresa.habilita_remitos
                %}checked{% endif %}>'''

new_text = '''<input class="form-check-input" type="checkbox" name="habilita_remitos" {% if empresa.habilita_remitos %}checked{% endif %}>'''

if old_text in content:
    content = content.replace(old_text, new_text)
    print("Fixed the split template tag")
else:
    print("Pattern not found, trying alternative...")
    # Try different line endings
    old_text2 = '<input class="form-check-input" type="checkbox" name="habilita_remitos" {% if empresa.habilita_remitos\r\n                %}checked{% endif %}>'
    if old_text2 in content:
        content = content.replace(old_text2, new_text)
        print("Fixed with Windows line endings")

# Write back
with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Updated {file_path}")
