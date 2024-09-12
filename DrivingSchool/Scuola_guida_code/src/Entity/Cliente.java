package Entity;
public class Cliente {
    
    final int NUM_PATENTI = 5;
    private String nome;
    private String cognome;
    private String data; //DataFormat
    private String email;
    private String residenza;
    private String ID;
    //Ad ogni indice è associata una patente nel rispettivo ordine: AM, A1, A2, A, B
    private Integer[] lista_patenti = new Integer[NUM_PATENTI];
    private String username;
    private String password;
    //La patente sarà indicata da un'indice 0, 1, 2, 3, 4 che indicherà AM, A1, A2, A, B
    private int patente;

    //Costruttore
    public Cliente(String n, String c, String d, String e, String r, String id, Integer[] l_p, int p) {
        this.nome = n;
        this.cognome = c;
        this.data = d;
        this.email = e;
        this.residenza = r;
        this.ID = id;
        this.patente = p;
        for(int i=0; i<NUM_PATENTI; i++) {
            lista_patenti[i] = l_p[i];
        }

        this.username = genera_username(this);
        this.password = genera_password(this);
    }

    // Metodo per generare username
    public String genera_username(Cliente c) {
        String user = c.cognome + c.ID;
        return user;
    }
    
    //Metodo per generare password
    public String genera_password(Cliente c) {
        String pass = c.ID;
        return pass;
    }

    //Metodi per tornarmi info utili sull'utente che mi servono in altri metodi
    public String get_email() {
        return email;
    }

    public String get_nome() {
        return nome;
    }

    public String get_cognome() {
        return cognome;
    }

    public String get_username() {
        return username;
    }

    public String get_password() {
        return password;
    }

    public String get_residenza() {
        return residenza;
    }

    public Integer[] get_lista() {
        return lista_patenti;
    }

    public String get_id() {
        return ID;
    }

    public String get_data() {
        return data;
    }

    public int get_patente() {
        return patente;
    }
}
