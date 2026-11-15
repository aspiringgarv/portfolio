package dev.garv.portfolio.common;

/** Single place for normalising user-supplied text before it is stored or broadcast. */
public final class TextSanitizer {
    private TextSanitizer() {}

    public static String clean(String raw, int max) {
        if (raw == null) return "";
        String s = raw.replaceAll("[\\p{Cntrl}&&[^\\n]]", " ").trim();
        return s.length() > max ? s.substring(0, max) : s;
    }
}
