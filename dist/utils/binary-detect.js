export function isBinaryContent(content) {
    // Check for null bytes which indicate binary content
    if (content.includes('\0')) {
        return true;
    }
    // Check ratio of non-printable characters
    const sample = content.slice(0, 8000);
    let nonPrintable = 0;
    for (let i = 0; i < sample.length; i++) {
        const code = sample.charCodeAt(i);
        // Allow common whitespace and printable ASCII
        if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
            nonPrintable++;
        }
    }
    // If more than 10% non-printable, consider binary
    return nonPrintable / sample.length > 0.1;
}
