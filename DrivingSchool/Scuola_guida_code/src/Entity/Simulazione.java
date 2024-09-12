package Entity;


import java.util.Date;

public class Simulazione {

    static final int NUM_DOMANDE = 40;

    private Domanda[] lista_domande = new Domanda[NUM_DOMANDE];
    private boolean esito;
    //Logica degli input; 0 vero, 1 falso, 2 non risposto
    private String[] lista_input = new String[NUM_DOMANDE];
    private Date sim_time;

    public Simulazione(Domanda[] d) {
        esito = false;
        for(int i=0; i<NUM_DOMANDE; i++) {
            lista_domande[i] = d[i];
            lista_input[i] = "2";
        }
    }

    public Domanda[] get_domande() {
        return lista_domande;
    }
    
    public String[] get_input() {
        return lista_input;
    }

    public boolean get_esito() {
        return esito;
    }

    public Date get_time() {
        return sim_time;
    }

    public void set_input(int index, String value) {
        lista_input[index] = value;
    }

    //Metodo che verifica la correttezza della simulazione, da chiamare alla 
    // fine degli input del cliente 
    public void check_test() {
        int wrong_ans = 0;
        for(int i=0; i<NUM_DOMANDE; i++) {
            if(lista_domande[i].is_correct(lista_input[i])) {
                //nothing
            }
            else {
            	wrong_ans++;
            }
        }
        if(wrong_ans > 5) {
            esito = false;
        }
        else {
        esito = true;
        }
    }
}
