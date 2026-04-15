#!/bin/bash
# Maven 없이 Java 소스를 컴파일하고 실행하는 스크립트

SRC_DIR="src/main/java"
OUT_DIR="target/classes"

mkdir -p "$OUT_DIR"

echo "Compiling..."
find "$SRC_DIR" -name "*.java" | xargs javac -d "$OUT_DIR"

if [ $? -eq 0 ]; then
    echo "Running..."
    java -cp "$OUT_DIR" com.example.Main
else
    echo "Compilation failed."
    exit 1
fi
