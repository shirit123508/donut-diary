#!/bin/bash
# סקריפט לפתיחת כל הקבצים ששונו בעורך קוד

echo "🔍 פותח את כל הקבצים ששונו בעורך..."
echo ""

# רשימת הקבצים המעניינים
FILES=(
  "CHANGES_SUMMARY.md"
  "README.md"
  "app/feed/page.jsx"
  "app/add/page.jsx"
  "app/family/page.jsx"
  "components/NavBar.jsx"
  "hooks/README.md"
  "services/README.md"
  "utils/README.md"
  "utils/StorageHelper.js"
  "utils/UrlHelper.js"
)

# פתיחת הקבצים ב-VS Code (או עורך ברירת המחדל)
if command -v code &> /dev/null; then
  echo "✓ פותח ב-VS Code..."
  for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
      code "$file"
      echo "  ✓ $file"
    fi
  done
elif command -v subl &> /dev/null; then
  echo "✓ פותח ב-Sublime Text..."
  subl "${FILES[@]}"
elif command -v atom &> /dev/null; then
  echo "✓ פותח ב-Atom..."
  atom "${FILES[@]}"
else
  echo "❌ לא נמצא עורך קוד"
  echo "נסי להריץ ידנית:"
  echo ""
  for file in "${FILES[@]}"; do
    echo "  code $file"
  done
fi

echo ""
echo "✨ סיימתי!"
