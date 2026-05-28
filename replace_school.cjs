const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const envFile = path.join(__dirname, '.env.example');
const pwConfig = path.join(__dirname, 'playwright.config.ts');

const replacements = [
    { from: /school_admin/g, to: 'org_admin' },
    { from: /student@school\.edu/g, to: 'member@org.com' },
    { from: /admin@school\.edu/g, to: 'admin@org.com' },
    { from: /student/g, to: 'member' },
    { from: /Student/g, to: 'Member' },
    { from: /PAYSTACK_SCHOOL_PLAN_CODE/g, to: 'PAYSTACK_ORG_PLAN_CODE' },
    { from: /planType === 'school'/g, to: "planType === 'org'" },
    { from: /plan === 'school'/g, to: "plan === 'org'" },
    { from: /plan: 'school'/g, to: "plan: 'org'" },
    { from: /'free' \| 'plus' \| 'pro' \| 'school'/g, to: "'free' | 'plus' | 'pro' | 'org'" },
    { from: /'plus' \| 'pro' \| 'school'/g, to: "'plus' | 'pro' | 'org'" },
    { from: /schoolFeatures/g, to: 'orgFeatures' },
    { from: /isSchoolAdmin/g, to: 'isOrgAdmin' },
    { from: /hasSchoolAccess/g, to: 'hasOrgAccess' },
    { from: /schoolName/g, to: 'orgName' },
    { from: /schoolProfile/g, to: 'orgProfile' },
    { from: /\?type=school/g, to: '?type=org' },
    { from: /School admin/gi, to: 'Organization admin' },
    { from: /School billing/gi, to: 'Organization billing' },
    { from: /School invite email/gi, to: 'Organization invite email' },
    { from: /School Dashboard/gi, to: 'Organization Dashboard' },
    { from: /Schools/g, to: 'Organizations' },
    { from: /school/g, to: 'org' },
    { from: /School/g, to: 'Org' },
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.svelte') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content;
            for (const rep of replacements) {
                updated = updated.replace(rep.from, rep.to);
            }
            if (content !== updated) {
                fs.writeFileSync(fullPath, updated, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(srcDir);

[envFile, pwConfig].forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let updated = content;
        for (const rep of replacements) {
            updated = updated.replace(rep.from, rep.to);
        }
        if (content !== updated) {
            fs.writeFileSync(file, updated, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
});
