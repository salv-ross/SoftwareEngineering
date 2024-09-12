package Entity;


public class Istruttore {
    static final int NUM_DISP = 3;
    static final int NUM_SETTIMANE = 5;
    private String nome;
    private String cognome;
    private String telefono;
    private String email;
    private String id;
    
    //Ogni istruttore deve comunicare esattamente 3 disponibilità 
    
    private String[] disp = new String[NUM_DISP];
    private String[] orario = new String[NUM_DISP];
    
    //Costruttore
    public Istruttore(String n, String c, String t, String e, String id, String[] d, String[] o) {
        this.nome = n;
        this.cognome = c;
        this.telefono = t;
        this.email = e;
        this.id = id;
        for(int i=0; i<NUM_DISP; i++) {
            disp[i] = d[i];
            orario[i] = o[i];
        }
    }

    //Metodi get vari
    public String get_nome() {
        return nome;
    }

    public String get_cognome() {
        return cognome;
    }

    public String get_telefono() {
        return telefono;
    }

    public String get_email() {
        return email;
    }
    
    public String[] get_disp() {
        return disp;
    }

    public String[] get_orario() {
        return orario;
    }

    public String get_id() {
        return id;
    }
    
    public void set_id(String s) {
    	this.id=s;
    }

}
