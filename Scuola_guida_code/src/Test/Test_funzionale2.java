package Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.Assert.*;
import static org.junit.Assert.assertEquals;
import java.util.Scanner;

import javax.swing.JOptionPane;

import java.sql.SQLException;


import Entity.Domanda;
import Entity.Istruttore;
import Entity.Cliente;
import Entity.Prenotazione;

import org.junit.jupiter.api.Test;

import Control.Control;

class Test_funzionale2 {

	//Test sulla funzionalit‡: Login Segretario
	@Test
	void testLogin_segretario() {
		
		System.out.println("Segretario unico nel sistema con username admin  e password admin");
		
		String username;
		String password;
		Scanner valore_inserito = new Scanner(System.in);
		
		System.out.println("Inserisci username segretario \n");
		username = valore_inserito.next();
		System.out.println("Inserisci password segretario \n");
		password = valore_inserito.next();
		
		
		if(username.equals("admin") && password.equals("admin"))
		{
			assertEquals(true,Control.check_segretario(username, password));
		}
		else
		{
			assertEquals(false,Control.check_segretario(username, password));
		}
		
	}
		
	
	//Test sulla funzionalit‡: Registrazione cliente
	@Test
	void testRegistra_client() throws SQLException {
		
		
		System.out.println("IN DATABASE CLIENTE: TEST, TEST, TEST, TEST, TEST, TEST, nessuna, AM");
		System.out.println("INSERIRE CLIENTE: nome, cognome, data, email, residenza, id, patenti prese (1 per presa 0 altrimenti), patente    nell'ordine: AM, A1, A2, A, B");
		
		Scanner valore_inserito = new Scanner(System.in);
		
		
		String nome = valore_inserito.next();
		String cognome = valore_inserito.next();
		String data = valore_inserito.next();
		String email = valore_inserito.next();
		String residenza = valore_inserito.next();
		String id = valore_inserito.next();
		Integer[] lista_pat = new Integer[5];
		lista_pat[0] = valore_inserito.nextInt();
		lista_pat[1] = valore_inserito.nextInt();
		lista_pat[2] = valore_inserito.nextInt();
		lista_pat[3] = valore_inserito.nextInt();
		lista_pat[4] = valore_inserito.nextInt();
		Integer pat = valore_inserito.nextInt();
		
		Entity.Cliente new_cl = new Entity.Cliente(nome, cognome, data, email, residenza, id, lista_pat, pat);
        int err = Control.new_client(new_cl);
        
        if(err == 1) {
    		System.out.println("Ricontrolla le informazioni inserite sulle patenti!");
    		assertEquals(1,err);
        }
        if(err == 2) {
    		System.out.println("Esiste gi√† un utente registrato con stessa mail!");
    		assertEquals("TEST",new_cl.get_email());
    	}
        
        if(err == 3) {
        	System.out.println("Esiste gi√† un utente registrato con stesso id!");
        	assertEquals("TEST",new_cl.get_id());
        }
        
        if(err == 0) {
        	System.out.println("Utente registrato correttamente "); 
        	assertEquals(0,err);
        } 
		
		
	}

	
	//Test sulla funzionalit‡: Registrazione istruttore
	@Test
	void testRegistra_dipendente() throws SQLException{
		//fail("Not yet implemented");
		System.out.println("IN DATABASE ISTRUTTORE: TEST, TEST, TEST, TEST, TEST, LUNEDI' 9, LUNEDI' 10, MARTEDI 9");
		System.out.println("INSERIRE ISTRUTTORE: nome, cognome, telefono, email, id, 3 disponiblita' fra LUN MAR MER GIO VEN ripetute, orari fra 9:00 10:00 .... 18:00 ");
		
		Scanner valore_inserito = new Scanner(System.in);
		
		
		String nome = valore_inserito.next();
		String cognome = valore_inserito.next();
		String telefono = valore_inserito.next();
		String email = valore_inserito.next();
		String id = valore_inserito.next();
		
		String[] nuove_disp = new String[3];
		nuove_disp[0] = valore_inserito.next();
		nuove_disp[1] = valore_inserito.next();
		nuove_disp[2] = valore_inserito.next();
		
		String[] orari = new String[3]; 
		orari[0] = valore_inserito.next();
		orari[1] = valore_inserito.next();
		orari[2] = valore_inserito.next();
		
		
		Entity.Istruttore new_is = new Entity.Istruttore(nome, cognome, telefono, email, id, nuove_disp, orari);
		 int err = Control.new_instructor(new_is);
        
        if(err == 1) {
    		System.out.println("disponibilit‡ diverse fra loro!");
    		assertEquals(1,err);
        }
        if(err == 3) {
    		System.out.println("Esiste gi√† un utente registrato con stessa mail!");
    		assertEquals("TEST",new_is.get_email());
    	}
        
        if(err == 4) {
        	System.out.println("Esiste gi√† un utente registrato con stesso id!");
        	assertEquals("TEST",new_is.get_id());
        }
        
        if(err == 2) {
        	System.out.println("Esiste gi√† un utente registrato con stesso telefono!");
        	assertEquals("TEST",new_is.get_telefono());
        }
        
        if(err == 0) {
        	System.out.println("Utente registrato correttamente "); 
        	assertEquals(0,err);
        } 
		
	}

}
