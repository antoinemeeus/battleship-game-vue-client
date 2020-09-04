module.exports = {
    extends: [
        // add more generic ruleset here, such as:
        // 'eslint:recommended',
        'plugin:vue/recommended'
    ],
    rules: {
        'no-unused-vars': 'off',
        'vue/no-side-effects-in-computed-properties': 'off'
    },
};