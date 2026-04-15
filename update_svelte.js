const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf8');

// Insert import if not exists
if (!code.includes("import './landing.css';")) {
    code = code.replace("import { isLoggedIn, profile } from '$lib/stores/auth';", "import { isLoggedIn, profile } from '$lib/stores/auth';\n\timport './landing.css';");
}

// Strip style block
code = code.replace(/<style>[\s\S]*<\/style>/g, '');

fs.writeFileSync('src/routes/+page.svelte', code);
