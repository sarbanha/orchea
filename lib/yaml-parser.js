/**
 * YAML Parser - Simple YAML parser for our configuration files
 */
class YAMLParser {
    static parse(yamlText) {
        const lines = yamlText.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        const result = {};
        let currentKey = null;
        let currentArray = null;

        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.includes(':') && !trimmed.startsWith('-')) {
                const [key, value] = trimmed.split(':').map(s => s.trim());
                
                if (value === '') {
                    // This might be an array key
                    currentKey = key;
                    currentArray = [];
                } else {
                    // Simple key-value pair
                    result[key] = value.replace(/['"]/g, '');
                }
            } else if (trimmed.startsWith('-') && currentKey && currentArray !== null) {
                // Array item
                const item = trimmed.substring(1).trim().replace(/['"]/g, '');
                currentArray.push(item);
                result[currentKey] = currentArray;
            }
        }

        return result;
    }
}
