package ma.solide.usermanagement.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CustomerVersionPolicyTest {

    private final CustomerVersionPolicy customerVersionPolicy = new CustomerVersionPolicy();

    @Test
    void shouldReturnTestversionWhenUserCountIsAtMostFive() {
        assertEquals("testversion", customerVersionPolicy.resolveVersion(0));
        assertEquals("testversion", customerVersionPolicy.resolveVersion(5));
    }

    @Test
    void shouldReturnBronzversionWhenUserCountIsBetweenSixAndTwenty() {
        assertEquals("bronzversion", customerVersionPolicy.resolveVersion(6));
        assertEquals("bronzversion", customerVersionPolicy.resolveVersion(20));
    }

    @Test
    void shouldReturnSilberWhenUserCountIsBetweenTwentyOneAndFifty() {
        assertEquals("silber", customerVersionPolicy.resolveVersion(21));
        assertEquals("silber", customerVersionPolicy.resolveVersion(50));
    }

    @Test
    void shouldReturnGoldWhenUserCountIsGreaterThanFifty() {
        assertEquals("gold", customerVersionPolicy.resolveVersion(51));
    }

    @Test
    void shouldResolveMaxUsersPerVersion() {
        assertEquals(5, customerVersionPolicy.resolveMaxUsers("testversion"));
        assertEquals(20, customerVersionPolicy.resolveMaxUsers("bronzversion"));
        assertEquals(50, customerVersionPolicy.resolveMaxUsers("silber"));
        assertEquals(Long.MAX_VALUE, customerVersionPolicy.resolveMaxUsers("gold"));
    }
}

