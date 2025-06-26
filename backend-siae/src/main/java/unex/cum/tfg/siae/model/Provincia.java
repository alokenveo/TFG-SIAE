package unex.cum.tfg.siae.model;

public enum Provincia {
    ANNOBON("Annobón"),
    BIOKO_NORTE("Bioko Norte"),
    BIOKO_SUR("Bioko Sur"),
    CENTRO_SUR("Centro Sur"),
    DJIBLOHO("Djibloho"),
    LITORAL("Litoral"),
    KIE_NTEM("Kie-Ntem"),
    WELE_NZAS("Wele-Nzas");

    private final String nombre;

    // Constructor
    Provincia(String nombre) {
        this.nombre = nombre;
    }

    // Getter
    public String getNombre() {
        return nombre;
    }
}

