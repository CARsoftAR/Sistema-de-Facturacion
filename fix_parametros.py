import os

file_path = r"c:\Sistemas CARSOFT\Sistema de facturacion\Sistema de facturacion\administrar\templates\administrar\parametros.html"

# Read the current content
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix all instances of == without spaces in Django template tags
import re

# Pattern to find {% if something=="value" %}
pattern = r'({% if [^}]+)==(")'
replacement = r'\1 == \2'

# Apply the fix
fixed_content = re.sub(pattern, replacement, content)

# Write back
with open(file_path, "w", encoding="utf-8") as f:
    f.write(fixed_content)

print(f"Fixed {file_path}")
print(f"Replaced {content.count('==')} occurrences")
