package Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.Assert.*;
import static org.junit.Assert.assertEquals;
import java.util.Scanner;
import java.sql.SQLException;


import Entity.Domanda;
import Entity.Istruttore;
import Entity.Cliente;
import Entity.Prenotazione;
import org.junit.jupiter.api.Test;

class Test_funzionale3 {

	@Test
	void testNotifyCliente() {
		String username = "USERNAME";
		String password = "PASSWORD";
		String email_cl = "EMAIL";
		String subject = "CREDENZIALI";
		
		//Control.Control.sendEmail(email_cl,subject," Le Tue Credenziali Sono : " + username + password);
		
		
	}

	@Test
	void testNotify_prenot() throws SQLException{
		//fail("Not yet implemented");
		//Control.Control.notify_prenot();
	}
	
	
}