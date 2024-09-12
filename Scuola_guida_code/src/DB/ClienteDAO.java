package DB;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.PreparedStatement;
import Entity.Cliente;


public class ClienteDAO {
	
	//Inserisce un nuovo cliente nel database
	public static void inserisci(Cliente c) {
		
		java.sql.Connection conn = DBManager.getInstance().getConnection();
		PreparedStatement s = null;

		try { 
			s = conn.prepareStatement("INSERT INTO CLIENTE (NOME, COGNOME, DATA, EMAIL, RESIDENZA, ID, PATENTE, PATENTE1, PATENTE2, PATENTE3, PATENTE4, PATENTE5, USERNAME, PASSWORD)" +
			"VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			
			s.setString(1, c.get_nome());
			s.setString(2, c.get_cognome());
			
			s.setString(3, c.get_data());
			s.setString(4, c.get_email());
				
			s.setString(5, c.get_residenza());
			s.setString(6, c.get_id());
			s.setInt(7, c.get_patente());
			Integer[] intlist = c.get_lista();
			int patente_presa = intlist[0];
			s.setInt(8, patente_presa);
			patente_presa = intlist[1];
			s.setInt(9, patente_presa);
			patente_presa = intlist[2];
			s.setInt(10, patente_presa);
			patente_presa = intlist[3];
			s.setInt(11, patente_presa);
			patente_presa = intlist[4];
			s.setInt(12, patente_presa);
			s.setString(13, c.get_username());
			s.setString(14, c.get_password());
			
			s.executeUpdate();
		} 
		catch(SQLException e) {
		System.out.println("Errore inserimento nuovo cliente \n" +e);
		}
		finally {
			try	{
				if (s != null) { s.close(); }
			}
			catch(SQLException e) {
				System.out.println("ERRRORE CONNESSIONE  \n" +e);		
			}
		}
	}

//Metodo che trova un cliente dal suo username	
public static Cliente trova_cliente(String usr)  {
	java.sql.Connection conn = DBManager.getInstance().getConnection();
	PreparedStatement s = null;
		try {
			s = conn.prepareStatement("SELECT * FROM CLIENTE WHERE USERNAME=?", Statement.RETURN_GENERATED_KEYS);
			s.setString(1, usr);
			ResultSet rs = s.executeQuery();
			if(rs.next()) {
				String nome = rs.getString(1);
				String cognome = rs.getString(2);
				String data = rs.getString(3);
				String email = rs.getString(4);
				String residenza = rs.getString(5);
				String id = rs.getString(6);
				int pat = rs.getInt(7);
				Integer[] lista_pat = new Integer[5];
				int y_pat = rs.getInt(8); 
				lista_pat[0]= y_pat;
				y_pat = rs.getInt(9); 
				lista_pat[1]= y_pat;
				y_pat = rs.getInt(10); 
				lista_pat[2]= y_pat;
				y_pat = rs.getInt(11); 
				lista_pat[3]= y_pat;
				y_pat = rs.getInt(12); 
				lista_pat[4]= y_pat;	
				Entity.Cliente cl = new Cliente(nome, cognome, data, email, residenza, id, lista_pat, pat);
				return cl;
			}
			else {
				return null;
			}
		}

		catch(SQLException sql) {
			System.out.println("Errore accesso al database \n");
			return null;
		}

		finally {
			try {
				if (s != null) { s.close(); }
			}
			catch(SQLException e) {
				System.out.println("ERRRORE CONNESSIONE  \n" +e);
				}
		}
	}

//Metodo che verifica la correttezza della mail inserita
public static boolean check_mail(String email){
	java.sql.Connection conn = DBManager.getInstance().getConnection();
	PreparedStatement s = null;

		try {
			s = conn.prepareStatement("SELECT EMAIL FROM CLIENTE WHERE EMAIL=?", Statement.RETURN_GENERATED_KEYS);

			s.setString(1, email);
			ResultSet rs = s.executeQuery();
			boolean var_quit = true;
			if(rs.next()) {
				if(email.equals(rs.getString(1))) {
					var_quit = false;
				}
			}

			return var_quit;
		}

		catch(SQLException e) {
			System.out.println("Errore accesso al database \n");
			return false;
		}

		finally {
			try {
				if (s != null) { s.close(); }
			}
			catch(SQLException e) {
				System.out.println("ERRRORE CONNESSIONE  \n" +e);
			}
		}
}

//Metodo che verifica la correttezza dell'id inserita
public static boolean check_id(String id) {
	java.sql.Connection conn = DBManager.getInstance().getConnection();
	PreparedStatement s = null;

		try {
			s = conn.prepareStatement("SELECT ID FROM CLIENTE WHERE ID=?", Statement.RETURN_GENERATED_KEYS);

			s.setString(1, id);
			ResultSet rs = s.executeQuery();
			boolean var_quit = true;
			if(rs.next()) {
				if(id.equals(rs.getString(1))) {
					var_quit = false;
				}
			}

			return var_quit;
		}

		catch(SQLException e) {
			System.out.println("Errore accesso al database \n");
			return false;
		}

		finally {
			try
			{
			if (s != null) { s.close(); }
			}
			catch(SQLException e) {
				System.out.println("ERRRORE CONNESSIONE  \n" +e);
				
				}
			}
}

//Metodo per l'autenticazione
public static boolean check_password(String usr, String pass) {
	java.sql.Connection conn = DBManager.getInstance().getConnection();
    PreparedStatement s = null;
	    
		try {
			s = conn.prepareStatement("SELECT * FROM CLIENTE WHERE USERNAME=? AND PASSWORD=?", Statement.RETURN_GENERATED_KEYS);

			s.setString(1, usr);
			s.setString(2, pass);

			ResultSet check = s.executeQuery();
			
			if(check.next()) {
				return true;
			}
			else {
				return false;
			}
		}
		catch(SQLException e) {
			System.out.println("Errore nel database \n" + e);
			return false;
		}
	}
}
