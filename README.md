# Quarto Report Builder

A powerful, client-side report generation tool built with React, TypeScript, and Vite. Quarto Report Builder allows users to create, edit, and export reports with support for Markdown, R, and Python code execution directly in the browser.

## Features

- **Drag-and-Drop Editor**: Easily arrange report blocks including text, code, images, and layout elements.
- **Polyglot Support**: Run R (via WebR) and Python (via Pyodide) code blocks directly in the browser.
- **Live Preview**: See your report update in real-time as you edit.
- **Split View**: Edit code and see the output side-by-side.
- **Dataset Management**: Import and manage datasets for use in your analysis.
- **Export Options**: Download your report as a zip file containing the source and assets.
- **Styling Customization**: Custom CSS support for HTML outputs (planned features for PDF styling).
- **Metadata Management**: Configure report metadata like title, author, and date.

## Tech Stack

- **Frontend Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **DnD Library**: @dnd-kit
- **Code Execution**:
  - [WebR](https://docs.r-wasm.org/webr/latest/) for R
  - [Pyodide](https://pyodide.org/en/stable/) for Python
- **Parsing**: PapaParse (CSV), Remark (Markdown)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd quartobuilder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## Building for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist` directory.

## License

[GNU GPLv3](LICENSE)
