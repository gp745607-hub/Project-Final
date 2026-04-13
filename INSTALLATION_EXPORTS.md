# 📦 INSTALLATION DES BIBLIOTHÈQUES D'EXPORT

Ce fichier explique comment installer les bibliothèques nécessaires pour les fonctionnalités d'export (Excel, PDF, Word, Codes-barres).

## 🎯 Bibliothèques requises

### 1. Export Excel (xlsx)

**Installation** :
```bash
npm install xlsx
```

**Usage** :
```typescript
import * as XLSX from 'xlsx'

const exportToExcel = (data: any[]) => {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, 'export.xlsx')
}
```

### 2. Export PDF (jspdf + html2canvas)

**Installation** :
```bash
npm install jspdf html2canvas
npm install --save-dev @types/html2canvas
```

**Usage** :
```typescript
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const exportToPDF = async () => {
  const pdf = new jsPDF()
  pdf.text('Hello World', 10, 10)
  pdf.save('document.pdf')
}
```

### 3. Génération de codes-barres (bwip-js)

**Installation** :
```bash
npm install bwip-js
npm install --save-dev @types/bwip-js
```

**Usage** :
```typescript
import bwipjs from 'bwip-js'

const generateBarcode = (text: string) => {
  const canvas = document.createElement('canvas')
  bwipjs.toCanvas(canvas, {
    bcid: 'code128',
    text: text,
    scale: 3,
    height: 10,
    includetext: true,
  })
  return canvas.toDataURL()
}
```

### 4. Export Word (docx)

**Installation** :
```bash
npm install docx
```

**Usage** :
```typescript
import { Document, Packer, Paragraph, TextRun } from 'docx'

const exportToWord = async () => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun('Hello World'),
          ],
        }),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'document.docx'
  link.click()
}
```

## 🚀 Installation complète

Pour installer toutes les bibliothèques d'un coup :

```bash
npm install xlsx jspdf html2canvas bwip-js docx
npm install --save-dev @types/html2canvas @types/bwip-js
```

## 📝 Vérification de l'installation

Après installation, vérifiez que tout fonctionne :

```bash
npm list xlsx jspdf html2canvas bwip-js docx
```

Vous devriez voir :

```
made_ong_humanitarian@1.0.0
├── bwip-js@4.5.1
├── docx@8.5.0
├── html2canvas@1.4.1
├── jspdf@2.5.2
└── xlsx@0.18.5
```

## 🔧 Configuration TypeScript

Si vous avez des erreurs TypeScript, ajoutez dans `tsconfig.json` :

```json
{
  "compilerOptions": {
    "types": ["node"],
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## 🐛 Dépannage

### Erreur : "Cannot find module 'xlsx'"

**Solution** :
```bash
npm install xlsx --force
```

### Erreur : "Module not found: Can't resolve 'canvas'"

**Solution** : Ignorez cette erreur, elle concerne Node.js, pas le navigateur.

Ajoutez dans `vite.config.ts` :

```typescript
export default defineConfig({
  resolve: {
    alias: {
      canvas: false,
    },
  },
})
```

### Erreur : "bwip-js requires a canvas"

**Solution** : Créez un canvas avant d'utiliser bwip-js :

```typescript
const canvas = document.createElement('canvas')
bwipjs.toCanvas(canvas, { ... })
```

## 📚 Documentation officielle

- **xlsx** : https://docs.sheetjs.com
- **jspdf** : https://github.com/parallax/jsPDF
- **html2canvas** : https://html2canvas.hertzen.com
- **bwip-js** : https://github.com/metafloor/bwip-js
- **docx** : https://docx.js.org

## ✅ Checklist d'installation

- [ ] xlsx installé
- [ ] jspdf installé
- [ ] html2canvas installé
- [ ] bwip-js installé
- [ ] docx installé
- [ ] Types TypeScript installés
- [ ] Vérification avec `npm list`
- [ ] Test d'export Excel
- [ ] Test d'export PDF
- [ ] Test de génération de code-barres
- [ ] Test d'export Word

## 🎉 Prêt à utiliser !

Une fois toutes les bibliothèques installées, vous pouvez utiliser toutes les fonctionnalités d'export de l'application ONG MADE.

---

**© 2026 ONG MADE - Madagascar Assistance & Development Emergency**
