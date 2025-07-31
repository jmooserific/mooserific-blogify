# Tumblr2Moose Utility

## Overview
Tumblr2Moose is a command-line utility designed to export Tumblr posts into a directory layout compatible with the Mooserific Blog. It uses the Tumblr API to retrieve posts from the specified blog, extracting relevant information and organizing it into a structured format.

## Features
- Converts Tumblr posts into a structured folder format.
- Generates `post.json` files with metadata including date, author, caption, and media.
- Downloads and organizes media files (photos and videos) with appropriate naming conventions.
- Handles duplicates and missing fields gracefully.
- Provides clear logging of the processing status.

## Installation
To install the necessary dependencies, run:

```sh
npm install
```

## Usage

Run the export utility with:

```sh
npx ts-node src/cli.ts --apiKey <your-tumblr-api-key> --blogName <your-blog-name> --out ./posts
```

### CLI Options

- `--apiKey` (required): Your Tumblr API key
- `--blogName` (required): The Tumblr blog name (e.g. `vemoose`)
- `--out` (required): Output directory for exported posts
- `--batchSize` (optional): Number of posts to fetch per API request (default: 20)
 - `--limit` (optional): Maximum number of posts to export

Each Tumblr post will be exported to a folder named `/YYYY-MM-DDTHH-MM/` containing a `post.json` and any media files.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.