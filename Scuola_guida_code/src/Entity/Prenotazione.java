package Entity;

public class Prenotazione {
    public String data;
    public String orario;
    //public Cliente client;
    public String usr;
    public String id_istr;
    //Costruttore
    public Prenotazione(String d, String o, String us, String id) {
        this.data = d;
        this.orario = o;
        this.usr = us;
        this.id_istr = id;
    }

    //Metodi vari
    public String get_client() {
    return usr;
    }

    public String get_istr() {
        return id_istr;
    }

    public String get_data() {
        return data;
    }

    public String get_orario() {
        return orario;
    }

}
