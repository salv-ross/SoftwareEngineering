package Boundary;

import java.time.LocalDate;

import javax.swing.*;

import Control.Control;

import java.awt.*;
import java.awt.event.ActionEvent;

import java.time.temporal.ChronoUnit;
import java.time.temporal.*;
import java.time.DayOfWeek;

//Metodo avviato dal BMain, presenta una schermata di login con autenticazione e successiva
//home page per il cliente che potrà decidere tra simulazione e prenotazione
public class boundary_client {

	static int flag=0;
	
    public static void main_client()  {
            JFrame FrameLogin = Control.nuovaFrame("Login Cliente", 540, 360);

            JLabel testo = new JLabel("Inserisci le credenziali");
            testo.setFont(new Font("Arial", Font.BOLD, 14));
            testo.setBounds(150, 30, 200, 20);
            FrameLogin.add(testo);
            
            JLabel label_username = new JLabel("Username:");
            label_username.setHorizontalAlignment(SwingConstants.CENTER);
            label_username.setFont(new Font("Arial", Font.BOLD, 14));
            label_username.setBounds(50, 100, 100, 20);
            FrameLogin.add(label_username);
            
            JLabel label_password = new JLabel("Password:");
            label_password.setHorizontalAlignment(SwingConstants.CENTER);
            label_password.setFont(new Font("Arial", Font.BOLD, 14));
            label_password.setBounds(250, 100, 100, 20);
            FrameLogin.add(label_password);

            JTextField textuser = new JTextField();
            textuser.setBounds(50, 150, 150, 20);
            FrameLogin.add(textuser);

            JPasswordField passuser = new JPasswordField();
            passuser.setBounds(250, 150, 150, 20);
            FrameLogin.add(passuser);

            //Bottone per tornare alla schermata precedente
            JButton goBack = Control.new_button(FrameLogin, "<=", 10, 10, 50, 50); 
            goBack.addActionListener((ActionEvent e) -> { 
            
                BMain.main(null);
                FrameLogin.dispose();
            });

            //Bottone per effettuare il login con autenticazione
            JButton do_login = Control.new_button(FrameLogin, "Login", 200, 200, 100, 20);
            do_login.addActionListener((ActionEvent e) -> {
                String temp_user = textuser.getText();
                String temp_pass = passuser.getText();
        
                if(Control.check_client(temp_user, temp_pass) == false) {
                    JOptionPane.showMessageDialog(null, "Username o Password errati!", "Errore", JOptionPane.ERROR_MESSAGE);
                }
                else {
                    get_home_page(temp_user);
                    FrameLogin.dispose();
                }
                
               
            });
        
    }

    //Metodo dopo il login che fa scegliere all'utente cosa fare tra prenotazione e simulazione 
    public static void get_home_page(String username) {
        JFrame FrameHomePage = Control.nuovaFrame("Home Page", 720, 480);

        String text = "Ciao " + username + ", cosa vuoi fare?";
        JLabel quest = new JLabel(text);
        quest.setBounds(100, 150, 300, 20);
        quest.setFont(new Font("Arial", Font.BOLD, 20));
        FrameHomePage.add(quest);

        JButton goBack = Control.new_button(FrameHomePage, "<=", 10, 10, 50, 50); 
        goBack.addActionListener((ActionEvent e) -> { 
            BMain.main(null);
            FrameHomePage.dispose();
        });

        //Bottone per effettuare una prenotazione
        JButton btnpren = Control.new_button(FrameHomePage, "Prenotazione", 150, 200, 150, 40);
        btnpren.addActionListener((ActionEvent e) -> {
           open_prenotation(username);
           FrameHomePage.dispose();
        });

        //Bottone per avviare una simulaziones
        JButton btnsim = Control.new_button(FrameHomePage, "Simulazione", 350, 200, 150, 40);
        btnsim.addActionListener((ActionEvent e) -> {
            pre_simulation(username);
            FrameHomePage.dispose();
        });
    }

    //Metodo che genera una frame con i componenti necessari alla prenotazione
    //Inserito l'id dell'istruttore, cliccare "cerca disponibilità"
    //Inserito il giorno (LUN, MAR, MER, GIO, VEN), cliccare "cerca giorni"
    //Infine, selezionare il giorno preciso tra i disponibili e prenotare
    public static void open_prenotation(String username) {
        JFrame FramePrenotazione = Control.nuovaFrame("Prenotazione", 640, 480);
        JLabel label_id = new JLabel("Inserisci l'id dell'istruttore");
        label_id.setBounds(100, 50, 200, 20);
        FramePrenotazione.add(label_id);
        LocalDate today = LocalDate.now();

        //Campo di input per l'id dell'istruttore
        JTextField jTextId = new JTextField();
        jTextId.setBounds(100, 75, 200, 20);
        FramePrenotazione.add(jTextId);
        
        JLabel label_giorno = new JLabel("Quando vuoi prenotare la lezione?");
        label_giorno.setBounds(200, 400, 200, 20);
        FramePrenotazione.add(label_giorno);
        
        //Bottone per tornare alla schermata precedente 
        JButton goBack = Control.new_button(FramePrenotazione, "<=", 10, 10, 50, 50); 
        goBack.addActionListener((ActionEvent e) -> { 
            get_home_page(username);
            FramePrenotazione.dispose(); 
        });
        
        //Inizializzo le strutture per l'interfaccia
        JButton btn_mid = Control.new_button(FramePrenotazione, "Cerca giorni", 200, 180, 100, 40);
        btn_mid.setVisible(false);

        JButton btnVerifica = Control.new_button(FramePrenotazione, "Verifica disponibilità", 200, 300, 100, 40);
        btnVerifica.setVisible(false);

        String[] dayStrings = new String[3];
        dayStrings[0] = "0"; 
        dayStrings[1] = "0";
        dayStrings[2] = "0";
        JComboBox<String> dayList = new JComboBox<String>(dayStrings);
        dayList.setBounds(200, 150, 200, 20);
        dayList.setSelectedIndex(0);
        FramePrenotazione.add(dayList);
        dayList.setVisible(false);
        String[] my_sett = new String[5];
        my_sett[0] = "Questa settimana";
        my_sett[1] = "Settimana prossima";
        my_sett[2] = "Tra due settimane";
        my_sett[3] = "Tra tre settimane";
        my_sett[4] = "Tra un mese";
        JComboBox<String> settList = new JComboBox<String>(my_sett);
        settList.setBounds(200, 250, 200, 20);
        settList.setSelectedIndex(0);
        FramePrenotazione.add(settList);
        settList.setVisible(false);

        //Bottone che cerca le disponibilità dell'istruttore
        JButton btn_search = Control.new_button(FramePrenotazione, "Cerca disponibilità", 200, 100, 140, 40); 
        btn_search.addActionListener((ActionEvent e) -> { 
            String[] day_disp = new String[3];
            String[] orari_disp = new String[3];
            //Dall'id dell'istruttore prendo le sue disponibilità
            //day_disp sarà del tipo [LUN, MAR, MER]
            //orari_disp sarà del tipo [15, 16, 17]
            day_disp = Control.search_disp_istr(jTextId.getText());
            orari_disp = Control.search_ora_istr(jTextId.getText());
            
            //Drop down list per la prenotazione 
            String[] my_disp = new String[3];
            my_disp[0] = day_disp[0] + " ORE " + orari_disp[0];
            my_disp[1] = day_disp[1] + " ORE " + orari_disp[1];
            my_disp[2] = day_disp[2] + " ORE " + orari_disp[2];
            for(int i=0; i<3; i++) {
               dayStrings[i] = my_disp[i];
            }
            dayList.setModel(new DefaultComboBoxModel<String>(dayStrings));
            dayList.setVisible(true);
            //Dall'id dell'istruttore prendo le disponibilità e gli orari
            btn_mid.setVisible(true);

            //Questo bottone cercherà i 5 giorni successivi del giorno selezionato, ad
            //esempio i 5 lunedì successivi
            btn_mid.addActionListener((ActionEvent e3) -> {
            
                //Questa riga di codice ritorna il valore della stringa selezionata dall'utente nella box
                //Esempio: se ha selezionato LUN ORE 15:00, tornerà LUN
                String ch_sett = Control.search_disp_istr(jTextId.getText())[dayList.getSelectedIndex()];
                LocalDate nextm = LocalDate.now();
                //In base al valore tornato, cerco il prossimo giorno rispetto alla data di oggi.
                //Ad esempio se oggi è mercoledì e l'utente vuole prenotare per LUNEDI, trovo
                //il lunedì prossimo e lo inserisco come primo valore della drop down list
                if(ch_sett.equals("LUN")) {
                    nextm = today.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
                    my_sett[0] = nextm.toString();
                }
                if(ch_sett.equals("MAR")) {
                    nextm = today.with(TemporalAdjusters.next(DayOfWeek.TUESDAY));
                    my_sett[0] = nextm.toString();
                }
                if(ch_sett.equals("MER")) {
                    nextm = today.with(TemporalAdjusters.next(DayOfWeek.WEDNESDAY));
                    my_sett[0] = nextm.toString();
                }
                if(ch_sett.equals("GIO")) {
                    nextm = today.with(TemporalAdjusters.next(DayOfWeek.THURSDAY));
                    my_sett[0] = nextm.toString();
                }
                if(ch_sett.equals("VEN")) {
                    nextm = today.with(TemporalAdjusters.next(DayOfWeek.FRIDAY));
                    my_sett[0] = nextm.toString();
                }
                
                //Calcolo gli altri valori della box spostandomi di una settimana alla volta, per un 
                //totale di cinque settimane
                LocalDate oneweek = nextm.plus(1, ChronoUnit.WEEKS);
                my_sett[1] = oneweek.toString();
                oneweek = nextm.plus(2, ChronoUnit.WEEKS);
                my_sett[2] = oneweek.toString();
                oneweek = nextm.plus(3, ChronoUnit.WEEKS);
                my_sett[3] = oneweek.toString();
                oneweek = nextm.plus(4, ChronoUnit.WEEKS);
                my_sett[4] = oneweek.toString();
                //Inserisco le cinque date nella drop down list dell'interfaccia
                settList.setModel(new DefaultComboBoxModel<String>(my_sett));
                settList.setVisible(true);
                btnVerifica.setVisible(true);
            
            });
        });
          
        btnVerifica.addActionListener((ActionEvent e2) -> {
            //Prendo id, giorno ed ora e cerco una prenotazione con quei valori tramite query.
            String id_istr = jTextId.getText(); 
            String giorno = settList.getSelectedItem().toString();
            String ch_hour = Control.search_ora_istr(id_istr)[dayList.getSelectedIndex()].toString();
            boolean is_disponibile  = DB.PrenotazioneDAO.is_available(id_istr, giorno, ch_hour);
            //Se l'istruttore è disponibile, apri schermata_conferma
            if(is_disponibile == true) {
                FramePrenotazione.dispose();
                schermata_conferma(username, id_istr, ch_hour, giorno);
            }
            //Se non è disponibile, apri schermata_non_disp
            else {
                schermata_non_disp();
            }  
        });
    }

    //Schermata prima della vera e propria simulazione
    public static void pre_simulation(String username) {
        JFrame FrameSimulazione = Control.nuovaFrame("Simulazione", 720, 480);
        JLabel jlab = new JLabel("Stai per avviare una nuova simulazione. Ti verranno sottoposte 40 domande a cui dovrai rispondere vero o falso, con più di 5 errori il test è fallito");
        jlab.setBounds(100, 100, 300, 20);
        FrameSimulazione.add(jlab);
        JButton goBack = Control.new_button(FrameSimulazione, "Avvia Simulazione", 200, 200, 100, 50); 
        goBack.addActionListener((ActionEvent e) -> { 
            avvia_simulazione();
            FrameSimulazione.dispose();
        });
        
    }

    //Schermata di conferma prenotazione con bottoni "Sì/No"
    public static void schermata_conferma(String username, String id_istr, String ora_pren, String data_pren) {
        
        JFrame FrameConferma = Control.nuovaFrame("Conferma prenotazione", 720, 480);
        JLabel testo = new JLabel("La prenotazione è disponibile. Confermare?");
        testo.setFont(new Font("Arial", Font.BOLD, 14));
        testo.setBounds(100, 30, 400, 20);
        FrameConferma.add(testo);
        JButton btnyes = Control.new_button(FrameConferma, "Si'", 100, 80, 100, 40);
        JButton btnno = Control.new_button(FrameConferma, "No", 300, 80, 100, 40);

        //istruzioni al click del bottone "sì"
        btnyes.addActionListener((ActionEvent e) -> {        
            Entity.Prenotazione p = new Entity.Prenotazione(data_pren, ora_pren, username, id_istr);
            Control.add_prenotazione(p);
            FrameConferma.dispose();
        });

        //istruzioni al click del bottone "no"
        btnno.addActionListener((ActionEvent e) -> {
            FrameConferma.dispose();
            open_prenotation(username);
        });
    }

    //Semplice schermata per la prenotazione non disponibile
    public static void schermata_non_disp() {
        JFrame FrameNonDisp = Control.nuovaFrame("Prenotazione non disponibile", 480, 480);
        JLabel jlab = new JLabel("Istruttore non disponibile. Selezionare un altro orario");
        jlab.setBounds(80, 30, 300, 30);
        FrameNonDisp.add(jlab);
        JButton btn_ok = new JButton("Ok");
        btn_ok.setBounds(200, 200, 80, 40);
        FrameNonDisp.add(btn_ok);
        btn_ok.addActionListener((ActionEvent e) -> { 
            FrameNonDisp.dispose(); 
        });
    }

    //In questo metodo dal database estraggo le 40 domande da sottoporre al cliente
    public static void avvia_simulazione() {
        //Creo una nuova simulazione prendendo dal db 40 domande casuali 
        //che inserisco in un oggetto simulazione  
        Entity.Simulazione mysim = DB.DomandaDAO.get_domande();
        //Genero una frame per ogni domanda chiudendo quella precedente
        genera_frame_domanda(mysim, 0);
    }
    
    public static void genera_frame_domanda(Entity.Simulazione simul, int index) {
        int domanda_num = index+1;
        JFrame quest_frame = Control.nuovaFrame("Simulazione: domanda numero " + domanda_num , 640, 480);
        JLabel question = new JLabel(simul.get_domande()[index].get_text());
        question.setBounds(50, 30, 300, 30);
        if(simul.get_domande()[index].get_img() != null) {
            //Qui andrebbe stampata l'immagine
        }
        quest_frame.add(question);
        //Creo due bottoni mutualmente esclusivi per la risposta
        JRadioButton btn_true = new JRadioButton("VERO");
        btn_true.setBounds(100, 100, 100, 40);
        JRadioButton btn_false = new JRadioButton("FALSO");
        btn_false.setBounds(300, 100, 100, 40);
        quest_frame.add(btn_false);
        quest_frame.add(btn_true);
        ButtonGroup btn_group = new ButtonGroup();
        btn_group.add(btn_true);
        btn_group.add(btn_false);
        //Bottone di conferma che salva la risposta selezionata nell'oggetto simulazione
        //Se il bottone VERO è selezionato, setta 0 nella logica .Se il bottone FALSE è 
        //selezionato, setta 1. Altrimenti (nessun bottone selezionato) setta 2, in 
        //questo modo ogni risposta non data è sbagliata.
        JButton btn_conferma = new JButton("->");
        quest_frame.add(btn_conferma);
        btn_conferma.setBounds(250, 250, 100, 40);
        index++;
        final int indice =index;    
         
        btn_conferma.addActionListener((ActionEvent e) -> { 	   		
            if(btn_true.isSelected()) {
                simul.set_input(indice-1, "0");
            }
            else if(btn_false.isSelected()) {
                simul.set_input(indice-1, "1");
            }
            quest_frame.dispose();
            //Se ci sono altre domande, mostra la prossima schermata
            if(indice-1<39) {
            	genera_frame_domanda(simul,indice);
            }
            //Altrimenti chiama il metodo per calcolare l'esito
            else {
             	check_test_metodo(simul);
            }
        });
            
    }

    //Metodo che controlla l'esito del test e mostra una schermata in base al risultato
    //L'esito è un boolean della simulazione che viene aggiornato da "check_test()"
    public static void check_test_metodo(Entity.Simulazione simul) {
        simul.check_test();

        if(simul.get_esito() == true) {
            JFrame frameEsito = Control.nuovaFrame("Esito", 480, 480);
            JLabel esito_text = new JLabel("Hai superato il test \n");
            esito_text.setBounds(100, 100, 100, 40);
            frameEsito.add(esito_text);
        }
        else {
            JFrame frameEsito = Control.nuovaFrame("Esito", 480, 480);
            JLabel esito_text = new JLabel("Non hai superato il test \n");
            esito_text.setBounds(100, 100, 100, 40);
            frameEsito.add(esito_text);
        }
    }
        
}