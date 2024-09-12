package Boundary;

import java.awt.*;
import java.awt.event.ActionEvent;
import javax.swing.*;
import Control.Control;
import java.time.*;

public class BMain {
	
    //Metodo che dev'essere avviato per primo, è un semplice boundary che chiede all'utente se è un 
    //cliente o se è il segretario della scuola guida. A seconda della scelta (ossia del bottone cliccato  
    //sull'interfaccia) sarà avviato il rispettivo boundary

    public static void main(String[] args)  {
        
        ZonedDateTime ora = ZonedDateTime.now();
        LocalTime now = ora.toLocalTime();
        int hour = now.getHour();
        //Il metodo notify_prenot() invia delle mail con le prenotazioni della giornata sia ai
        //clienti che ai dipendenti. Per semplicità abbiamo un if che controlla che
        //l'orario sia tra le 7:00 e le 7:59 (richiesta della traccia) per avviare il metodo, 
        //in un'ipotetica implementazione più accurata questo metodo sarebbe eseguito da un 
        //server sempre attivo.
        if(hour == 7) {
        	Control.notify_prenot();
        }
        
        JFrame newFrame = Control.nuovaFrame("Scuola guida", 500, 300);
        JLabel testo = new JLabel("Sei un cliente o un segretario?");
        testo.setFont(new Font("Arial", Font.BOLD, 14));
        testo.setBounds(100, 30, 400, 20);
        newFrame.add(testo);
        JButton buttoncl = Control.new_button(newFrame, "Cliente", 80, 80, 100, 40);
        JButton buttonsec = Control.new_button(newFrame, "Segretario",220,80,  100, 40);
        JButton buttonexit = Control.new_button(newFrame, "Exit", 170, 150, 60, 40);
        //istruzioni eseguite al click sul bottone "cliente"
        buttoncl.addActionListener((ActionEvent e) -> { 
            Boundary.boundary_client.main_client();
            newFrame.dispose();
        });

        //istruzioni eseguite al click sul bottone "segretario"
        buttonsec.addActionListener((ActionEvent e) -> { 
            Boundary.boundary_segretario.login_segretario();
            newFrame.setVisible(false);
        });

        //istruzioni eseguite al click sul bottone "exit"
        buttonexit.addActionListener((ActionEvent e) -> { 
            newFrame.dispose();
        });
    }
}