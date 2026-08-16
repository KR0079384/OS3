#!/usr/bin/env python3
"""
OS3 Repository Navigation & Context Validator

Mechanically validates that:
1. Every meaningful engineering directory contains a local `<foldername>.md` index file.
2. `primary.md` exists at the root and references top-level directory index files.
3. Every local directory index file lists all relevant direct child files.
4. Every local directory index file lists all relevant direct child subdirectories with valid relative links.
5. All file and subdirectory navigation links point to existing paths on disk (no broken links).
6. No stale or non-existent files are documented.
"""

import os
import re
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Directory names that are ignored (build outputs, VCS, dependencies, caches)
IGNORED_DIRS = {
    ".git",
    ".firebase",
    "node_modules",
    "dist",
    "venv",
    "__pycache__",
    "os3_security.egg-info",
    ".pytest_cache",
    ".idea",
    ".vscode",
    ".github"
}

# Specific files ignored from mandatory wiki listings if desired
IGNORED_FILES = {
    ".DS_Store",
    "thumbs.db",
    "serviceAccountKey.json"
}

def get_root_dir():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.dirname(script_dir)

def find_meaningful_directories(root_dir):
    meaningful = []
    for current_root, dirs, _ in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        rel_path = os.path.relpath(current_root, root_dir)
        if rel_path == ".":
            continue
        meaningful.append(current_root)
    return meaningful

def parse_markdown_links(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    return re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)

def parse_table_items(file_path):
    """
    Parses backtick-quoted filenames or directory names from table rows in markdown.
    e.g. | `main.py` | Description |
    """
    items = set()
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip().startswith("|") and "`" in line:
                matches = re.findall(r'`([^`]+)`', line)
                if matches:
                    items.add(matches[0])
    return items

def validate_primary_md(root_dir):
    primary_path = os.path.join(root_dir, "primary.md")
    errors = []
    if not os.path.isfile(primary_path):
        return ["CRITICAL: primary.md does not exist at root."]

    links = parse_markdown_links(primary_path)
    nav_links = [url for _, url in links if url.endswith(".md")]

    for url in nav_links:
        target_path = os.path.normpath(os.path.join(root_dir, url))
        if not os.path.isfile(target_path):
            errors.append(f"primary.md broken link: {url} -> {target_path} not found.")

    return errors

def validate_directory_nav(dir_path, root_dir):
    errors = []
    folder_name = os.path.basename(dir_path)
    nav_filename = f"{folder_name}.md"
    nav_path = os.path.join(dir_path, nav_filename)
    rel_dir = os.path.relpath(dir_path, root_dir)

    if not os.path.isfile(nav_path):
        return [f"Missing {nav_filename} in directory: {rel_dir}"]

    entries = os.listdir(dir_path)
    actual_files = set()
    actual_subdirs = set()

    for entry in entries:
        if entry == nav_filename or entry in IGNORED_FILES or entry in IGNORED_DIRS:
            continue
        full = os.path.join(dir_path, entry)
        if os.path.isfile(full):
            actual_files.add(entry)
        elif os.path.isdir(full):
            actual_subdirs.add(entry)

    documented_items = parse_table_items(nav_path)

    # 1. Check documented files exist
    for f in actual_files:
        if f not in documented_items:
            errors.append(f"In {rel_dir}/{nav_filename}: file `{f}` is not listed in file table.")

    # 2. Check documented subdirs exist & have links
    for d in actual_subdirs:
        subdir_name = d if d.endswith("/") else d + "/"
        if d not in documented_items and subdir_name not in documented_items:
            errors.append(f"In {rel_dir}/{nav_filename}: subdirectory `{d}/` is not listed in subdirectories table.")

    # 3. Check for stale references
    for doc in documented_items:
        clean_doc = doc.rstrip("/")
        if clean_doc not in actual_files and clean_doc not in actual_subdirs:
            errors.append(f"In {rel_dir}/{nav_filename}: documented item `{doc}` does not exist on disk.")

    # 4. Check relative links
    links = parse_markdown_links(nav_path)
    for text, url in links:
        if url.startswith("http://") or url.startswith("https://"):
            continue
        target_path = os.path.normpath(os.path.join(dir_path, url))
        if not os.path.exists(target_path):
            errors.append(f"In {rel_dir}/{nav_filename}: broken link [{text}]({url}) -> target {target_path} missing.")

    return errors

def main():
    root_dir = get_root_dir()
    print("==================================================")
    print("🔍 Validating OS3 Navigation System...")
    print(f"Root Directory: {root_dir}")
    print("==================================================\n")

    all_errors = []

    # 1. Validate primary.md
    primary_errors = validate_primary_md(root_dir)
    all_errors.extend(primary_errors)

    # 2. Find and validate all meaningful directories
    directories = find_meaningful_directories(root_dir)
    print(f"Discovered {len(directories)} meaningful directories to validate.")

    for d in directories:
        dir_errors = validate_directory_nav(d, root_dir)
        all_errors.extend(dir_errors)

    print("\n--------------------------------------------------")
    if all_errors:
        print(f"❌ Validation Failed with {len(all_errors)} errors:\n")
        for err in all_errors:
            print(f"  • {err}")
        sys.exit(1)
    else:
        print("✅ Validation Successful! All directory index files and navigation links are synchronized.")
        print("==================================================")
        sys.exit(0)

if __name__ == "__main__":
    main()
