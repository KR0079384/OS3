from setuptools import setup, find_packages

setup(
    name="os3-security",
    version="0.1.2",
    description="OS³ Supply Chain Security Scanner",
    author="OS3 Team",

    packages=find_packages(),

    include_package_data=True,

    # ✅ ONLY include necessary backend source files
    package_data={
        "os3": [
            "backend/**/*.py",
            "backend/requirements.txt"
        ]
    },

    install_requires=[
        "typer",
        "rich",
        "requests"
    ],

    entry_points={
        "console_scripts": [
            "os3=os3.cli:app"
        ]
    },

    python_requires=">=3.8",
)