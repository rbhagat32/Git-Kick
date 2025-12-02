# Steps to publish:

1. increase the version in package.json
2. npm i -g vsce
3. if personal access token is expired, generate new one (with full access):
   - https://dev.azure.com/raghavbhagat32/_usersSettings/tokens
   - vsce login rbhagat32
4. vsce publish
