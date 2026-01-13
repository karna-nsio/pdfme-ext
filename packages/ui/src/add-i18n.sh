#!/bin/bash
# Add missing i18n keys to all language dictionaries

# Backup file
cp i18n.ts i18n.ts.backup

# Add the keys to each language section
# We'll add after the table.columnStyle entry in each language

# For each language, add the same keys
sed -i "/^  'schemas.table.columnStyle'/a\
  'schemas.table.rowGroups': 'Row Groups',\
  'schemas.table.rowGroupTitle': 'Title',\
  'schemas.table.startRow': 'Start Row',\
  'schemas.table.spanAllColumns': 'Span All Columns'," i18n.ts

sed -i "/^  'schemas.text.fontName'/a\
  'schemas.text.fontWeight': 'Font Weight'," i18n.ts

echo "Done! Please review i18n.ts"
