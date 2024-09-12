package Control;

import java.time.LocalDate;

import Entity.Prenotazione;
import Entity.Cliente;
import Entity.Istruttore;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import javax.swing.*;
import java.awt.*;

import javax.mail.*;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;


public class Control {
    static final int NUM_DISP = 3;
    static final int NUM_SETTIMANE = 5;
	static final int NUM_PATENTI = 5;
    static final int NUM_DOMANDE = 40;
    private static final String user_segr = "admin";
    private static final String pass_segr = "admin";

    //Metodo che prende un nuovo cliente, verifica la correttezza delle informazioni
    //inserite tramite alcuni metodi e se corrette inserisce nel db
    //il nuovo cliente
    public static int new_client(Cliente c)  {
        //Primo metodo: verifico email e id della carta d'identità
        boolean bool_pat = check_patente(c.get_lista(), c.get_patente());
        if(bool_pat == false) {
            return 1;
        }
        boolean bool_mail = DB.ClienteDAO.check_mail(c.get_email());
        if(bool_mail == false) {
            return 2;
        }

        boolean bool_id = DB.ClienteDAO.check_id(c.get_id());
        if(bool_id == false) {
            return 3;
        }
        notify(c);
        //Informazioni inserite correttamente, posso inserire nel db il nuovo cliente
        DB.ClienteDAO.inserisci(c);
        return 0;
    }

    //Metodo che prende in input i dati per un nuovo istruttore (si accede dal case)
    public static int new_instructor(Istruttore ist) {
    		int[][]s_d=new int[3][5];
    		for(int i=0;i<3;i++) {
    			for(int j=0;j<5;j++) {
    			  s_d[i][j]=0;
    		    }
    		}
            
        //Verifico che le tre disponibilità siano diverse
        String[] new_disp = new String[NUM_DISP];
        new_disp[0] = ist.get_disp()[0] + " " + ist.get_orario()[0];
        new_disp[1] = ist.get_disp()[1] + " " + ist.get_orario()[1];
        new_disp[2] = ist.get_disp()[2] + " " + ist.get_orario()[2];

        if(new_disp[0].equals(new_disp[1]) || new_disp[1].equals(new_disp[2]) || new_disp[0].equals(new_disp[2])) {
        	return 1;
        }

        //Verificare che la mail e il telefono non siano gli stessi di un altro istruttore già presente
        if(DB.IstruttoreDAO.check_tel(ist.get_telefono()) == false) { return 2; }
        if(DB.IstruttoreDAO.check_email(ist.get_email()) == false) { return 3; }
        if(DB.IstruttoreDAO.check_id(ist.get_id()) == false) { return 4;}

        //se le info sono corrette, creare l'istruttore e aggiungerlo al database
        DB.IstruttoreDAO.inserisci(ist);
        return 0;
    }

    //Metodo per verificare che l'utente abbia inserito le patenti correttmamente
    public static boolean check_patente(Integer[] lista, int pat) {
        if(lista[pat] == 1) {
            return false;
        }
        else {
            return true;
        }
    }

    //Metodo per valutare la correttezza delle disponibilità inserite
    public static boolean check_disp(String[] nuove_disp) {
        if(nuove_disp[0].equals(nuove_disp[1]) || nuove_disp[1].equals(nuove_disp[2]) || nuove_disp[0].equals(nuove_disp[2])) {
        	return false;
        }
        return true;
    }

    //Metodo chiamato dal boundary_client per verificare la correttezza di username 
    //e password del login di un cliente, ritornerà un boolean
    public static boolean check_client(String user, String pass)  {
    	boolean ans = DB.ClienteDAO.check_password(user, pass);
    	return ans;
    }
   
    //Metodo che verifica se username e password del segretario sono corrette. 
    public static boolean check_segretario(String user, String pass) {
        if(user.equals(user_segr) && user.equals(pass_segr)) {
            return true;
        }
        return false;
    }   
    
    //Metodo che invia le credenziali al cliente appena registrato
    public static void notify(Cliente cl)  {
        String username = cl.get_password();
        String password = cl.get_username();
        String email = cl.get_email();
        String subject = "CREDENZIALI SCUOLA GUIDA";
        String text = "Ciao " + cl.get_nome() + cl.get_cognome() + " queste sono i tuoi dati: Username " + username +" Password " + password;
        //Qui andrebbe inviata la mail, abbiamo anche scritto il metodo 
        //ma non abbiamo avuto il tempo di implementarlo a pieno

        //sendEmail(email, subject, text);

    }

    //Metodo che invia effettivamente la mail
    public static void sendEmail(String email, String subject, String text) {
        String host = "smtp.mail.yahoo.com";
        Properties properties = System.getProperties();
    
        properties.put("mail.smtp.host", host);
        properties.put("mail.smtp.port", "587");
        properties.put("mail.smtp.starttls.enable", "true");
        properties.put("mail.smtp.ssl.protocols", "TLSv1.2");
        properties.put("mail.smtp.auth", "true");
    
        Session session = Session.getInstance(properties, new javax.mail.Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("scuolaguida@yahoo.com", "");
            }
        });
    
        try {
            MimeMessage message = new MimeMessage(session);
    
            message.setFrom(new InternetAddress("scuolaguida@yahoo.com"));
            message.addRecipient(Message.RecipientType.TO, new InternetAddress(email));
            message.setSubject(subject);
            message.setText(text);
    
            System.out.println("sending...");
            Transport.send(message);
            System.out.println("Sent message successfully....");
        } catch (MessagingException mex) {
            mex.printStackTrace();
        }
    }
   
    //Metodo che cerca i giorni delle disponibilità dell'istruttore
    public static String[] search_disp_istr(String id)  {    
        String[] disp_istr = DB.IstruttoreDAO.get_disp(id);
        return disp_istr;   
    }

    //Metodo che cerca gli orari delle disponibilità dell'istruttore
    public static String[] search_ora_istr(String id)  {
        String[] orari_istr = DB.IstruttoreDAO.get_orari(id);
        return orari_istr;
    }

    //Metodo che comunica col DAO e inserisce una prenotazione del Database
    public static void add_prenotazione(Prenotazione p)  {
        DB.PrenotazioneDAO.inserisci(p);
    }

    //Metodo scritto per semplificare la creazione di una frame dell'interfaccia
    public static JFrame nuovaFrame(String name, int x, int y) {
        JFrame newFrame = new JFrame(name);
        Dimension dimFrame = new Dimension(x, y);
        newFrame.setPreferredSize(dimFrame);
        newFrame.setLayout(null);
        newFrame.setVisible(true);
        newFrame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        newFrame.pack();
        return newFrame;
    }
    
    //Metodo scritto per semplificare la creazione di un bottone dell'interfaccia
    public static JButton new_button(JFrame newFrame, String text, int x, int y, int width, int height) {
        JButton b=new JButton(text);
        b.setBorderPainted(true);
        b.setBounds(x, y, width, height);
        newFrame.add(b);
        return b;
    }
    
    //Metodo che invia le prenotazioni per oggi al cliente e al segretario
    public static void notify_prenot()  {

        //Ottengo la prenotazione del cliente per "oggi"
    	LocalDate today = LocalDate.now();
        System.out.println("INVIO EMAIL PROMEMORIA per APPUNTAMENTI del");
        System.out.println(today);
        List<String> list_prenotati = DB.PrenotazioneDAO.get_pren_today_client(today);
        List<String> list_occupati = DB.PrenotazioneDAO.get_occup_today_istr(today);
        
        
        System.out.println("INVIO ");
        Cliente cl;
        Istruttore is;
        String email_istr = new String();
        String email_cli = new String();
        String subject = "SCUOLA GUIDA: PRENOTAZIONI PER LA GIORNATA DI OGGI";
        int i=0;
        String text_cli = "Le tue prenotazioni di oggi sono alle ore: \n";
        String text_istr = "I tuoi appuntamenti di oggi sono alle ore: \n";
        List<String> orari =  new ArrayList<String>();
        
        //Invio mail agli istruttori
        while(i < list_occupati.size()) {
            is = DB.IstruttoreDAO.trova_istruttore(list_occupati.get(i));
            email_istr = is.get_email();
            orari = DB.PrenotazioneDAO.get_orari_istr(today, list_occupati.get(i));
            for(int j=0; j<orari.size();j++) {
            text_istr = text_istr + orari.get(j);
            text_istr = text_istr + "con il cliente " + DB.ClienteDAO.trova_cliente(DB.PrenotazioneDAO.get_client_istr(today, list_occupati.get(i), orari.get(j))).get_nome() + DB.ClienteDAO.trova_cliente(DB.PrenotazioneDAO.get_client_istr(today, list_occupati.get(i), orari.get(j))).get_cognome();
            
            }
            //Il metodo è stato scritto ma non implementato per mancanza di tempo
            i++;
            //sendEmail(email_istr, subject, text_istr);
        }
        i=0;
        //Invio mail ai clienti 
        while(i < list_prenotati.size()) {
        	cl = DB.ClienteDAO.trova_cliente(list_prenotati.get(i));
            email_cli = cl.get_email();
            orari = DB.PrenotazioneDAO.get_orari_client(today, list_prenotati.get(i));
            for(int j=0; j<orari.size();j++) {
            text_cli = text_cli + orari.get(j);
            text_cli = text_cli + "con l'istruttore " + DB.IstruttoreDAO.trova_istruttore(DB.PrenotazioneDAO.get_istr_client(today, list_prenotati.get(i), orari.get(j))).get_nome() + " " + DB.IstruttoreDAO.trova_istruttore(DB.PrenotazioneDAO.get_istr_client(today, list_prenotati.get(i), orari.get(j))).get_cognome() + " " + DB.IstruttoreDAO.trova_istruttore(DB.PrenotazioneDAO.get_istr_client(today, list_prenotati.get(i), orari.get(j))).get_telefono();
            }
            //Il metodo è stato scritto ma non implementato per mancanza di tempo
            i++;
            //sendEmail(email_cli, subject, text_cli);
        }   

    }

}