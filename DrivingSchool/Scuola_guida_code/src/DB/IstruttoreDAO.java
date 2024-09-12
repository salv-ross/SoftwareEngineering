package DB;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.PreparedStatement;
import Entity.Istruttore;

public class IstruttoreDAO {
	final static int NUM_DISP = 3;	
	
	//Inserisce un nuovo istruttore nel database
	public static void inserisci(Istruttore ist) {
		
		java.sql.Connection conn = DBManager.getInstance().getConnection();
		PreparedStatement s = null;

		try { 
			s = conn.prepareStatement("INSERT INTO ISTRUTTORE (NOME, COGNOME, TELEFONO, EMAIL, ID, DISP1, DISP2, DISP3, ORARIO1, ORARIO2, ORARIO3)" +
					"VALUES (?,?,?,?,?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);
			
			s.setString(1, ist.get_nome());
			s.setString(2, ist.get_cognome());
			
			s.setString(3, ist.get_telefono());
			s.setString(4, ist.get_email());

            s.setString(5, ist.get_id());

			String[] disp = ist.get_disp();
			String sqlArray = disp[0];
			s.setString(6, sqlArray);
			sqlArray = disp[1];
			s.setString(7, sqlArray);
			sqlArray = disp[2];
			s.setString(8, sqlArray);
			
			String[] ora = ist.get_orario();
			String sqlora = ora[0];
			s.setString(9, sqlora);
			sqlora = ora[1];
			s.setString(10, sqlora);
			sqlora = ora[2];
			s.setString(11, sqlora);
			
			s.executeUpdate();
			
		} 
		catch(SQLException e) {
		System.out.println("Errore inserimento nuovo istruttore \n" + e);
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


 	// Ritorna la classe istruttore con tutte le info dell'istruttore cercato
 	public static Istruttore trova_istruttore(String myid) {
	 	java.sql.Connection conn = DBManager.getInstance().getConnection();
	 	PreparedStatement s = null;

		try {
			s = conn.prepareStatement("SELECT * FROM ISTRUTTORE WHERE ID=?", Statement.RETURN_GENERATED_KEYS);
			s.setString(1, myid);

			ResultSet rs = s.executeQuery();
			String[] disp = new String[3];
			disp[0]=" ";
			disp[1]=" ";
			disp[2]=" ";
			if(!(rs.next())) {
					Entity.Istruttore is= new Entity.Istruttore(null,null,null,null," ",disp,disp);
					return is;
			}
			String nome = rs.getString(1);
			String cognome = rs.getString(2);
			String telefono = rs.getString(3);
			String email = rs.getString(4);
			String id = rs.getString(5);
			
			String array_disp = rs.getString(6);
			disp[0]=array_disp;
		 	array_disp = rs.getString(7);
			disp[1]=array_disp;
			array_disp = rs.getString(8);
			disp[2]=array_disp;

			String[] ora = new String[3];
			String ora_disp = rs.getString(9);
			ora[0]=ora_disp;
			ora_disp = rs.getString(10);
			ora[1]=ora_disp;
			ora_disp = rs.getString(11);
			ora[2]=ora_disp;
			Entity.Istruttore istr = new Istruttore(nome, cognome, telefono, email, id, disp,ora);
			return istr;
		}
		catch(SQLException sql) {
			System.out.println("NON HO TROVATO L'ISTRUTTORE");
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

 //Verifica se il telefono inserito già esiste
    public static boolean check_tel(String tel)  {
	 	java.sql.Connection conn = DBManager.getInstance().getConnection();
	 	PreparedStatement s = null;
		try {
			s = conn.prepareStatement("SELECT TELEFONO FROM ISTRUTTORE WHERE TELEFONO=?", Statement.RETURN_GENERATED_KEYS);
			s.setString(1, tel);
			ResultSet rs = s.executeQuery();
			boolean var_quit = true;
			if(rs.next()) {
				if(rs.getString(1) != null) {
					var_quit = false;
				}
			}
			return var_quit;
		}

		catch(SQLException e) {
			System.out.println("Errore accesso al database \n" +e);
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

	
	//Verifica se la mail inserita già esiste
 	public static boolean check_email(String email)  {
	 	java.sql.Connection conn = DBManager.getInstance().getConnection();
	 	PreparedStatement s = null;

		try {
			s = conn.prepareStatement("SELECT EMAIL FROM ISTRUTTORE WHERE EMAIL=?", Statement.RETURN_GENERATED_KEYS);

			s.setString(1, email);
			ResultSet rs = s.executeQuery();
			boolean var_quit = true;
			if(rs.next()) {
				if(rs.getString(1).equals(email)) {
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

 //Metodo per vedere se l'id inserito è già presente nel db
 public static boolean check_id(String id)  {
	 java.sql.Connection conn = DBManager.getInstance().getConnection();
	 PreparedStatement s = null;

	 try {
			s = conn.prepareStatement("SELECT ID FROM ISTRUTTORE WHERE ID=?", Statement.RETURN_GENERATED_KEYS);
			s.setString(1, id);
			ResultSet rs = s.executeQuery();
			boolean var_quit = true;
			if(rs.next()) {
				if(rs.getString(1) != null) {
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

	//Metodo che torna le tre disponibilità dell'istruttore
	public static String[] get_disp(String id)  {
	java.sql.Connection conn = DBManager.getInstance().getConnection();
	PreparedStatement s = null;

	   try {
		   s = conn.prepareStatement("SELECT DISP1, DISP2, DISP3 FROM ISTRUTTORE WHERE ID= ?", Statement.RETURN_GENERATED_KEYS);
		   s.setString(1, id);
		   ResultSet rs = s.executeQuery();
		   rs.next();
		   String[] my_disp = new String[3];
		   my_disp[0] = rs.getString(1);
		   my_disp[1] = rs.getString(2);
		   my_disp[2] = rs.getString(3);
		   return my_disp;
	    }
	    catch(SQLException e) {
		   System.out.println("Errore accesso al db istruttore \n" +e);
		   return null;
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

	//Metodo che torna i tre orari delle disponibilità dell'istruttore
	public static String[] get_orari(String id)  {
        java.sql.Connection conn = DBManager.getInstance().getConnection();
        PreparedStatement s = null;
    
            try {
               s = conn.prepareStatement("SELECT ORARIO1, ORARIO2, ORARIO3 FROM ISTRUTTORE WHERE ID =?", Statement.RETURN_GENERATED_KEYS);
               s.setString(1, id);
               ResultSet rs = s.executeQuery();
               rs.next();
               String[] my_orari = new String[3];
               my_orari[0] = rs.getString(1);
               my_orari[1] = rs.getString(2);
               my_orari[2] = rs.getString(3);
               return my_orari;
            }
            catch(SQLException e) {
               System.out.println("Errore accesso al db istruttore \n" +e);
               return null;
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
}

