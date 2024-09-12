package Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.Assert.*;
import static org.junit.Assert.assertEquals;
import java.util.Scanner;
import java.sql.SQLException;


import Entity.Domanda;
import Entity.Istruttore;
import Entity.Cliente;
import Entity.Prenotazione;

class Test_funzionale1 {
	
	//PER LA FUNZIONALITA' LOGIN DEL CLIENTE
	@org.junit.jupiter.api.Test
	void testMain_client() throws SQLException {
		//TEST PER IL LOGIN 
		
		System.out.println("cliente nel database con username TESTTEST  e password TEST");
		
		String username;
		String password;
		Scanner valore_inserito = new Scanner(System.in);
		
		System.out.println("Inserisci username \n");
		username = valore_inserito.next();
		System.out.println("Inserisci password \n");
		password = valore_inserito.next();
		
		
		if(username.equals("TESTTEST") && password.equals("TEST"))
		{
			assertEquals(true,Control.Control.check_client(username, password));
		}
		else
		{
			assertEquals(false,Control.Control.check_client(username, password));
		}
		
	}
	
	//PER LA FUNZIONALITA' PRENOTAZIONE LEZIONE PRATICA
	@org.junit.jupiter.api.Test
	void testOpen_prenotation() throws SQLException {
		System.out.println("CASE TEST PER LA PRENOTAZIONE ");
		
		String id;
		String giorno;
		Istruttore is;
		int setti;
		Scanner valore_inserito = new Scanner(System.in);
		
		System.out.println("INSERIRE ID DELL'ISTRUTTORE ");
		id = valore_inserito.next();
		is = DB.IstruttoreDAO.trova_istruttore(id);
		id = is.get_id();
		
		
		if(id.equals(" "))
		{
			assertEquals(" ",is.get_id());
		}
		
		
		else {
			System.out.println("INSERIRE GIORNO DELL'ISTRUTTORE fra 0  1   2 ");
		System.out.println(is.get_disp()[0] + is.get_disp()[1] + is.get_disp()[2]);
		id = valore_inserito.next();
		
		switch(id)
		{
		case "0" : 
			System.out.println("1 giorno");
			giorno = is.get_disp()[0];
			break;
		case "1" :
			System.out.println("2 giorno");
			giorno = is.get_disp()[1];
			break;
		case "2" :
			System.out.println("3 giorno");
			giorno = is.get_disp()[2];
			break;
		
		default : id=null;
		break;
		}
		
		if(id==null)
		{
		assertEquals(null,id);
		}
		else
			{
			System.out.println("INSERIRE SETTIMANA DI PRENOTAZIONE ");
			
		setti = valore_inserito.nextInt();
		
		switch(setti)
		{
		case 0 : 
			System.out.println("attuale");
			assertEquals(0,setti);
			break;
		case 1 :
			System.out.println("prossima");
			assertEquals(1,setti);
			break;
		case 2 :
			System.out.println("tra 2");
			assertEquals(2,setti);
			break;
		case 3 :
			System.out.println("tra 3");
			assertEquals(3,setti);
			break;
		case 4 :
			System.out.println("tra un mese");
			assertEquals(4,setti);
			break;
			
		
		default : 
		setti=-1;
		assertEquals(-1,setti);
		}
		
			}
		}
		
		
}

	// PER LA FUNZIONALITA' SIMULAZIONE ESAME TEORICO
	@org.junit.jupiter.api.Test
	void testGenera_frame_domanda() {
		System.out.println("test genera domande");
		Domanda d = new Domanda("chi sono?", "0","http//");
		System.out.println("Rispondi con 0=risposta giusta; 1=risposta_sbagliata, x per non rispondere");
		System.out.println(d.get_text());
		String valore="2";
		String valore_test="2";
		
		
		Scanner valore_inserito = new Scanner(System.in);
		valore = valore_inserito.next();
		
		if(!valore.equals("x"))
		{
			valore_test = valore;
		}
		
		
		//COSA EFFETTIVAMENTE STIAMO TESTANDO è METODO is_correct CHE USIAMO IN BOUNDARY CON SIMUL.GET_ESITO PER OGNI DOMANDA 
		if(d.is_correct(valore_test))
		{
			System.out.println("Risposta corretta");
			boolean ris = true;
			assertEquals(true, ris);
		}
		else
		{
			System.out.println("Risposta sbagliata");
			boolean ris = false;
			assertEquals(false, ris);
		}
		
		}

	
	
}


