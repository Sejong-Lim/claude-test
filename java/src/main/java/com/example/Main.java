package com.example;

public class Main {

    public static String greet(String name) {
        return "Hello, " + name + "!";
    }

    public static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        System.out.println(greet("World"));
        System.out.println("1 + 2 = " + add(1, 2));
    }
}
