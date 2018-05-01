/**
 * Why should i write my own thing?
 * @param {array} prompts
 * @returns {Promise<any>}
 */
function ask(prompts) {
    return new Promise(function (resolve, reject) {
        let current = -1;
        let results = [];
        let listener = (input) => {
            results.push(input.trim());
            next();
        };
        let next = () => {
            current++;
            if (current > prompts.length - 1) {
                stdin.removeListener('data', listener);
                return resolve(results);
            }
            process.stdout.write(prompts[current].prompt);
        };
        let stdin = process.stdin;
        stdin.setEncoding('utf8');
        stdin.on('data', listener);
        next();
    });
};

module.exports = ask;