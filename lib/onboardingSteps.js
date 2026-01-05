export const dashboardSteps = [
    {
        element: 'h1',
        popover: {
            title: 'Welcome to PlagDetect',
            description: 'This is your central hub for plagiarism detection and academic integrity.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '[role="tablist"]',
        popover: {
            title: 'Choose Input Method',
            description: 'Paste your text directly or upload a document (PDF, DOCX).',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: 'button[type="submit"], .bg-primary',
        popover: {
            title: 'Start Analysis',
            description: 'Click here to begin the deep semantic scan.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '.grid-cols-3',
        popover: {
            title: 'Quick Stats',
            description: 'View your recent activity and performance trends here.',
            side: 'top',
            align: 'start'
        }
    }
];
