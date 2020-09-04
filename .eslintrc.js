module.exports = {
    extends: [
        'plugin:vue/recommended'
    ],
    parserOptions: {
        parser: 'babel-eslint'
    },
    plugins: ['vue'],
    rules: {
        'no-unused-vars': 'off',
        'vue/no-side-effects-in-computed-properties': 'off',
        'vue/html-closing-bracket-spacing': ['error', {
            'startTag': 'never',
            'endTag': 'never',
            'selfClosingTag': 'never'
        }]
    },
};