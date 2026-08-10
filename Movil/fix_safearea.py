import os
import glob
import re

def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Check if we import SafeAreaView from react-native
    if re.search(r"import\s+\{[^}]*SafeAreaView[^}]*\}\s+from\s+['\"]react-native['\"]", content):
        # Remove SafeAreaView from the import
        content = re.sub(r"SafeAreaView,\s*", "", content)
        content = re.sub(r",\s*SafeAreaView", "", content)
        content = re.sub(r"\{\s*SafeAreaView\s*\}", "{}", content)
        
        # Add the import from react-native-safe-area-context
        content = "import { SafeAreaView } from 'react-native-safe-area-context';\n" + content
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith(".tsx"):
            fix_file(os.path.join(root, file))
