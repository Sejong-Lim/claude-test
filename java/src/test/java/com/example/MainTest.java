package com.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class MainTest {

    @Test
    void testGreet() {
        assertEquals("Hello, World!", Main.greet("World"));
        assertEquals("Hello, Java!", Main.greet("Java"));
    }

    @Test
    void testAdd() {
        assertEquals(3, Main.add(1, 2));
        assertEquals(0, Main.add(-1, 1));
        assertEquals(0, Main.add(0, 0));
    }
}
