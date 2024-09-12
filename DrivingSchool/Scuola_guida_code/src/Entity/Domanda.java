package Entity;


public class Domanda {

    public String testo;
    public String risposta;
    public String immagine;

    //Costruttore
    public Domanda(String t, String r, String i) {
        this.testo = t;
        this.risposta = r;
        this.immagine = i;
    }

    //Metodi utili
    public String get_text() {
        return testo;
    }
    
    public String get_risposta() {
        return risposta;
    }

    public String get_img() {
        return immagine;
    }

    //Valuta la correttezza della domanda rispetto ad un input del cliente, serve in Simulazione()
    public boolean is_correct(String input) {
        if(input.equals(this.risposta)) {
            return true;
        }
        else 
            return false;
    }

}


