package Boundary;

import Control.Control;
import Entity.*;
import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;

//Avviato dal BMain dopo aver cliccato sul bottone "segretario"
public class boundary_segretario {
    final static int NUM_PATENTI = 5;

    //Metodo di login con autenticazione
    public static void login_segretario() {
        JFrame frameLogin = Control.nuovaFrame("Login segretario", 540, 360);
        JLabel testo = new JLabel("Inserisci le credenziali");
        testo.setFont(new Font("Arial", Font.BOLD, 14));
        testo.setBounds(150, 100, 200, 20);
        frameLogin.add(testo);
        
        JLabel label_username = new JLabel("Username:");
        label_username.setHorizontalAlignment(SwingConstants.CENTER);
        label_username.setFont(new Font("Arial", Font.BOLD, 14));
        label_username.setBounds(50, 170, 100, 20);
        frameLogin.add(label_username);
        
        JLabel label_password = new JLabel("Password:");
        label_password.setHorizontalAlignment(SwingConstants.CENTER);
        label_password.setFont(new Font("Arial", Font.BOLD, 14));
        label_password.setBounds(250, 170, 100, 20);
        frameLogin.add(label_password);

        JButton goBack = Control.new_button(frameLogin, "<=", 10, 10, 50, 50); 
        goBack.addActionListener((ActionEvent e) -> { 
            BMain.main(null);
            frameLogin.dispose();
        });

        JTextField textuser = new JTextField();
        textuser.setBounds(50, 200, 150, 20);
        frameLogin.add(textuser);

        JPasswordField passuser = new JPasswordField();
        passuser.setBounds(250, 200, 150, 20);
        frameLogin.add(passuser);

        JButton do_login = new JButton("Login");
        do_login.setBounds(175, 250, 100, 20);
        frameLogin.add(do_login);
        do_login.addActionListener((ActionEvent e) -> {
        
            //Verifica che temp_user e temp_pass siano corretti
            String temp_user = textuser.getText();
            String temp_pass = passuser.getText();
            if(Control.check_segretario(temp_user, temp_pass) == true) {
                main_segretario();
                frameLogin.dispose();
            }
            else {
                JOptionPane.showMessageDialog(null, "Username o Password errati!", "Errore", JOptionPane.ERROR_MESSAGE);
            }
        });
    }

    //Home page segretario
    public static void main_segretario() {
    JFrame FrameHomePage = Control.nuovaFrame("Scuola guida", 540, 480);
    JLabel testo = new JLabel("Vuoi registrare un nuovo cliente o un nuovo dipendente?");
    testo.setFont(new Font("Arial", Font.BOLD, 14));
    testo.setBounds(40, 100, 500, 20);
    FrameHomePage.add(testo);
    JButton goBack = Control.new_button(FrameHomePage, "<=", 10, 10, 50, 50); 
    goBack.addActionListener((ActionEvent e) -> { 
            login_segretario();
            FrameHomePage.dispose();    
    });

    //Bottoni per far decidere cosa fare al segretario
    JButton buttoncl = Control.new_button(FrameHomePage, "Cliente", 100, 180, 100, 40);
    JButton buttondip = Control.new_button(FrameHomePage, "Dipendente",300,180, 100, 40);
    JButton buttonexit = Control.new_button(FrameHomePage, "Exit", 220, 240, 60, 40);

    //Istruzioni al click del bottone "Cliente"
    buttoncl.addActionListener((ActionEvent e) -> { 
        
        Boundary.boundary_segretario.registra_client();
        FrameHomePage.setVisible(false);
    });

    //Istruzioni al click del bottone "Dipendente"
    buttondip.addActionListener((ActionEvent e) -> {     
        Boundary.boundary_segretario.registra_dipendente();
        FrameHomePage.setVisible(false);   
    });

    //Istruzioni al click del bottone "Exit"
    buttonexit.addActionListener((ActionEvent e) -> { 
                FrameHomePage.dispose();
    });
}

//Metodo per registrare un cliente
public static void registra_client()  {
    JFrame newClientFrame = Control.nuovaFrame("Registrazione nuovo cliente", 1080, 720);

    JButton goBack = Control.new_button(newClientFrame, "<-", 10, 10, 50, 50); 
        goBack.addActionListener((ActionEvent e) -> { 
            main_segretario();
            newClientFrame.dispose();
        });

    //Inizializzo label e text field per l'interfaccia... 
    JLabel label_nome = new JLabel("Nome:");
    label_nome.setHorizontalAlignment(SwingConstants.CENTER);
    label_nome.setFont(new Font("Arial", Font.BOLD, 14));
    label_nome.setBounds(50, 100, 100, 20);
    newClientFrame.add(label_nome);
  
    JTextField textnome = new JTextField();
    textnome.setBounds(50, 150, 150, 20);
    newClientFrame.add(textnome);

    JLabel label_cognome = new JLabel("Cognome:");
    label_cognome.setHorizontalAlignment(SwingConstants.CENTER);
    label_cognome.setFont(new Font("Arial", Font.BOLD, 14));
    label_cognome.setBounds(250, 100, 100, 20);
    newClientFrame.add(label_cognome);
  
    JTextField textcognome = new JTextField();
    textcognome.setBounds(250, 150, 150, 20);
    newClientFrame.add(textcognome);

    JLabel label_email = new JLabel("Email:");
    label_email.setHorizontalAlignment(SwingConstants.CENTER);
    label_email.setFont(new Font("Arial", Font.BOLD, 14));
    label_email.setBounds(450, 100, 100, 20);
    newClientFrame.add(label_email);
  
    JTextField textemail = new JTextField();
    textemail.setBounds(450, 150, 150, 20);
    newClientFrame.add(textemail);

    JLabel label_data = new JLabel("Data di nascita (DD/MM/YYYY):");
    label_data.setHorizontalAlignment(SwingConstants.CENTER);
    label_data.setFont(new Font("Arial", Font.BOLD, 14));
    label_data.setBounds(650, 100, 100, 20);
    newClientFrame.add(label_data);
  
    JTextField textdata = new JTextField();
    textdata.setBounds(650, 150, 150, 20);
    newClientFrame.add(textdata);

    JLabel label_address = new JLabel("Residenza:");
    label_address.setHorizontalAlignment(SwingConstants.CENTER);
    label_address.setFont(new Font("Arial", Font.BOLD, 14));
    label_address.setBounds(50, 200, 100, 20);
    newClientFrame.add(label_address);
  
    JTextField textaddress = new JTextField();
    textaddress.setBounds(50, 250, 150, 20);
    newClientFrame.add(textaddress);

    JLabel label_id = new JLabel("ID carta d'identità:");
    label_id.setHorizontalAlignment(SwingConstants.CENTER);
    label_id.setFont(new Font("Arial", Font.BOLD, 14));
    label_id.setBounds(250, 200, 100, 20);
    newClientFrame.add(label_id);
  
    JTextField textid = new JTextField();
    textid.setBounds(250, 250, 150, 20);
    newClientFrame.add(textid);

    JLabel label_pat = new JLabel("Patente da conseguire:");
    label_pat.setHorizontalAlignment(SwingConstants.CENTER);
    label_pat.setFont(new Font("Arial", Font.BOLD, 14));
    label_pat.setBounds(450, 200, 100, 20);
    newClientFrame.add(label_pat);

    String[] patStrings = {"AM", "A1", "A2", "A", "B"};
    JComboBox<String> disp_list2 = new JComboBox<String>(patStrings);
    disp_list2.setBounds(450, 250, 100, 20);
    disp_list2.setSelectedIndex(0);
    newClientFrame.add(disp_list2);

    JLabel l_altre_pat = new JLabel("Patenti già in possesso:");
    l_altre_pat.setHorizontalAlignment(SwingConstants.CENTER);
    l_altre_pat.setFont(new Font("Arial", Font.BOLD, 14));
    l_altre_pat.setBounds(650, 200, 100, 20);
    newClientFrame.add(l_altre_pat);
      
    JRadioButton[] btns = new JRadioButton[5];
    btns[0] = new JRadioButton("AM");
    btns[0].setBorderPainted(false);
    btns[0].setBounds(650, 250, 60, 20);
    newClientFrame.add(btns[0]);

    btns[1] = new JRadioButton("A1");
    btns[1].setBorderPainted(false);
    btns[1].setBounds(650, 275, 60, 20);
    newClientFrame.add(btns[1]);
    
    btns[2] = new JRadioButton("A2");
    btns[2].setBorderPainted(false);
    btns[2].setBounds(650, 300, 60, 20);
    newClientFrame.add(btns[2]);
    
    btns[3] = new JRadioButton("A");
    btns[3].setBorderPainted(false);
    btns[3].setBounds(650, 325, 60, 20);
    newClientFrame.add(btns[3]);
    
    btns[4] = new JRadioButton("B");
    btns[4].setBorderPainted(false);
    btns[4].setBounds(650, 350, 60, 20);
    newClientFrame.add(btns[4]);

    //Bottone per confermare la registrazione
    JButton btn_registra = Control.new_button(newClientFrame, "Registra", 300, 300, 100, 40);
    newClientFrame.add(btn_registra);
    //Al click del bottone "registra", prendo le info inserite, le controllo 
    //e se sono corrette le inserisco nel database
    btn_registra.addActionListener((ActionEvent e) -> {
        String nome = textnome.getText();
        String cognome = textcognome.getText();
        String data = textdata.getText();
        String email = textemail.getText();
        String residenza = textaddress.getText();
        String id = textid.getText();
        int pat = disp_list2.getSelectedIndex();
        //Prendo la lista delle patenti
        Integer[] lista_pat = new Integer[5];
        for(int i=0; i<NUM_PATENTI; i++) {
            if(btns[i].isSelected() == true) {
                lista_pat[i] = 1;
            }
            else {
            	lista_pat[i] = 0;
            }
        }
        Entity.Cliente new_cl = new Entity.Cliente(nome, cognome, data, email, residenza, id, lista_pat, pat);
        int err = Control.new_client(new_cl);
        //Nel metodo chiamato sopra ritorno un intero che dà informazioni sul tipo di errore verificatosi
        if(err == 1) {
            JOptionPane.showMessageDialog(null, "Ricontrolla le informazioni inserite sulle patenti!", "Errore", JOptionPane.ERROR_MESSAGE);
        }
        if(err == 2) {
            JOptionPane.showMessageDialog(null, "Esiste già un utente registrato con stessa mail!", "Errore", JOptionPane.ERROR_MESSAGE);
        }
        if(err == 3) {
            JOptionPane.showMessageDialog(null, "Esiste già un utente registrato con stesso id!", "Errore", JOptionPane.ERROR_MESSAGE);
        }
        if(err == 0) {
            JOptionPane.showMessageDialog(null, "Cliente inserito correttamente, credenziali inviate via mail", "Conferma", JOptionPane.DEFAULT_OPTION);
            newClientFrame.dispose();
        }      
    });
}

//Metodo per registrare un nuovo dipendente
public static void registra_dipendente() {

    JFrame newDipFrame = Control.nuovaFrame("Registrazione nuovo dipendente",1080, 720);
    JButton goBack = Control.new_button(newDipFrame, "<-", 30, 30, 50, 50); 
    goBack.addActionListener((ActionEvent e) -> { 
        main_segretario();
        newDipFrame.dispose();
    });

    //Inizializzo label, text field e liste drop down per l'interfaccia... 
    JLabel label_nome = new JLabel("Nome:");
    label_nome.setHorizontalAlignment(SwingConstants.CENTER);
    label_nome.setFont(new Font("Arial", Font.BOLD, 14));
    label_nome.setBounds(50, 100, 100, 20);
    newDipFrame.add(label_nome);
  
    JTextField textnome = new JTextField();
    textnome.setBounds(50, 150, 150, 20);
    newDipFrame.add(textnome);

    JLabel label_cognome = new JLabel("Cognome:");
    label_cognome.setHorizontalAlignment(SwingConstants.CENTER);
    label_cognome.setFont(new Font("Arial", Font.BOLD, 14));
    label_cognome.setBounds(250, 100, 100, 20);
    newDipFrame.add(label_cognome);
  
    JTextField textcognome = new JTextField();
    textcognome.setBounds(250, 150, 150, 20);
    newDipFrame.add(textcognome);

    JLabel label_email = new JLabel("Email:");
    label_email.setHorizontalAlignment(SwingConstants.CENTER);
    label_email.setFont(new Font("Arial", Font.BOLD, 14));
    label_email.setBounds(450, 100, 100, 20);
    newDipFrame.add(label_email);
  
    JTextField textemail = new JTextField();
    textemail.setBounds(450, 150, 150, 20);
    newDipFrame.add(textemail);

    JLabel label_tel = new JLabel("Telefono:");
    label_tel.setHorizontalAlignment(SwingConstants.CENTER);
    label_tel.setFont(new Font("Arial", Font.BOLD, 14));
    label_tel.setBounds(650, 100, 100, 20);
    newDipFrame.add(label_tel);
  
    JTextField textdata = new JTextField();
    textdata.setBounds(650, 150, 150, 20);
    newDipFrame.add(textdata);
   
    JLabel label_id = new JLabel("ID:");
    label_id.setHorizontalAlignment(SwingConstants.CENTER);
    label_id.setFont(new Font("Arial", Font.BOLD, 14));
    label_id.setBounds(850, 100, 100, 20);
    newDipFrame.add(label_id);
  
    JTextField textid = new JTextField();
    textid.setBounds(850, 150, 150, 20);
    newDipFrame.add(textid);

    String[] disp_list = {"LUN", "MAR", "MER", "GIO", "VEN"};
    String[] orari_list = {"9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"};

    JLabel label_disp1 = new JLabel("Prima disponibilità:");
    label_disp1.setHorizontalAlignment(SwingConstants.CENTER);
    label_disp1.setFont(new Font("Arial", Font.BOLD, 14));
    label_disp1.setBounds(100, 200, 150, 20);
    newDipFrame.add(label_disp1);
    
    JComboBox<String> disp_list1 = new JComboBox<String>(disp_list);
    disp_list1.setBounds(100, 225, 60, 20);
    disp_list1.setSelectedIndex(0);
    newDipFrame.add(disp_list1);
    JComboBox<String> orari_list1 = new JComboBox<String>(orari_list);
    orari_list1.setBounds(180, 225, 60, 20);
    orari_list1.setSelectedIndex(0);
    newDipFrame.add(orari_list1);
   
    JLabel label_disp2 = new JLabel("Seconda disponibilità:");
    label_disp2.setHorizontalAlignment(SwingConstants.CENTER);
    label_disp2.setFont(new Font("Arial", Font.BOLD, 14));
    label_disp2.setBounds(250, 200, 200, 20);
    newDipFrame.add(label_disp2);

    JComboBox<String> disp_list2 = new JComboBox<String>(disp_list);
    disp_list2.setBounds(300, 225, 60, 20);
    disp_list2.setSelectedIndex(0);
    newDipFrame.add(disp_list2);
    JComboBox<String> orari_list2 = new JComboBox<String>(orari_list);
    orari_list2.setBounds(380, 225, 60, 20);
    orari_list2.setSelectedIndex(0);
    newDipFrame.add(orari_list2);

    JLabel label_disp3 = new JLabel("Terza disponibilità:");
    label_disp3.setHorizontalAlignment(SwingConstants.CENTER);
    label_disp3.setFont(new Font("Arial", Font.BOLD, 14));
    label_disp3.setBounds(450, 200, 200, 20);
    newDipFrame.add(label_disp3);
  
    JComboBox<String> disp_list3 = new JComboBox<String>(disp_list);
    disp_list3.setBounds(500, 225, 60, 20);
    disp_list3.setSelectedIndex(0);
    newDipFrame.add(disp_list3);
    JComboBox<String> orari_list3 = new JComboBox<String>(orari_list);
    orari_list3.setBounds(580, 225, 60, 20);
    orari_list3.setSelectedIndex(0);
    newDipFrame.add(orari_list3);

    JButton btn_registra = Control.new_button(newDipFrame, "Registra", 300, 300, 100, 40);
    newDipFrame.add(btn_registra);
    btn_registra.addActionListener((ActionEvent e) -> {
        //Al click del bottone "registra", prendo le info inserite, le controllo 
        //e se sono corrette le inserisco nel database
        String nome = textnome.getText();
        String cognome = textcognome.getText();
        String telefono = textdata.getText();
        String email = textemail.getText();
        String id = textid.getText();
        String[] orari = new String[3]; 
        orari[0] = (String) orari_list1.getSelectedItem();
        orari[1] = (String) orari_list2.getSelectedItem();
        orari[2] = (String) orari_list3.getSelectedItem();
        String[] nuove_disp = new String[3];
        nuove_disp[0] = (String) disp_list1.getSelectedItem();
        nuove_disp[1] = (String) disp_list2.getSelectedItem();
        nuove_disp[2] = (String) disp_list3.getSelectedItem();
        Istruttore new_istr = new Istruttore(nome, cognome, telefono, email, id, nuove_disp, orari);
        
        int err = Control.new_instructor(new_istr);
        //Nel metodo chiamato sopra ritorno un intero che dà informazioni sul tipo di errore verificatosi
        if(err == 0) {
            JOptionPane.showMessageDialog(null, "La registrazione e' stata completata correttamente", "Registrazione completata", JOptionPane.DEFAULT_OPTION);
            newDipFrame.dispose();
        }
        if(err == 1) {
            JOptionPane.showMessageDialog(null, "Le disponibilita'  devono essere diverse tra di loro!", "Errore", JOptionPane.ERROR_MESSAGE);
        }
        if(err == 2) {
            JOptionPane.showMessageDialog(null, "Esiste già un dipendente con questo numero di telefono", "Errore", JOptionPane.ERROR_MESSAGE);
        }
        if(err == 3) {
            JOptionPane.showMessageDialog(null, "Esiste già un dipendente con questa mail", "Errore", JOptionPane.ERROR_MESSAGE);
        }
        if(err == 4) {
            JOptionPane.showMessageDialog(null, "Esiste già un dipendente con questo id", "Errore", JOptionPane.ERROR_MESSAGE);
        }      
    });
}
}
