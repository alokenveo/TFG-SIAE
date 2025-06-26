package unex.cum.tfg.siae.pruebas;

import unex.cum.tfg.siae.model.Provincia;

public class TestProvincia {
    public static void main(String[] args) {
        for (Provincia p : Provincia.values()) {
            System.out.println(p + " => " + p.getNombre());
        }
    }
}

