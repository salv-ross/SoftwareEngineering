package DB;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.sql.PreparedStatement;
import Entity.Prenotazione;
import java.sql.ResultSet;
import java.util.List;
import java.util.ArrayList;

public class PrenotazioneDAO {
    
    //Inserisce una prenotazione nel database
    public static void inserisci(Prenotazione p)  {
        java.sql.Connection conn = DBManager.getInstance().getConnection();
		PreparedStatement s = null;

        try {
            
            s = conn.prepareStatement("INSERT INTO PRENOTAZIONE " + "VALUES (?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS);

            s.setString(2, p.get_data());
            s.setString(1, p.get_orario());
            s.setString(3, p.get_client());
            s.setString(4, p.get_istr());

            s.executeUpdate();
        }
        catch(SQLException e) {
            System.out.println("Errore accesso al db prenotazione \n" +e);
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

    //Metodo che ritorna la lista delle prenotazioni del cliente per "oggi" (parametro passato)
    public static List<String> get_pren_today_client(LocalDate today)  {

        java.sql.Connection conn = DBManager.getInstance().getConnection();
		PreparedStatement s = null;

        try {
            
            s = conn.prepareStatement("SELECT * FROM PRENOTAZIONE WHERE DATA=?", Statement.RETURN_GENERATED_KEYS);

            String tod= today.toString();
            s.setString(1, tod);
            boolean flag=true;

            ResultSet rs = s.executeQuery();

            List<String> mypren = new ArrayList<String>();

            while(rs.next()) {

                String username_client = new String();
                username_client = rs.getString(3);

                for(int i=0; i<mypren.size();i++)
                {
                	if((username_client.equals(mypren.get(i))))
                	{
                		flag=false;
                	}
                }
                if(flag==true)
                {
                	 mypren.add(username_client);
                }
                flag=true;
                
            }
            return mypren;
        }
        catch(SQLException e) {
            System.out.println("Errore accesso al db prenotazione \n"+e);
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

    //Metodo che verifica se un istruttore è già occupato quel giorno a quell'ora
    public static boolean is_available(String id_istr, String giorno_pren, String orario_pren)  {
        java.sql.Connection conn = DBManager.getInstance().getConnection();
		PreparedStatement s = null;

        try {
            
            s = conn.prepareStatement("SELECT ID_ISTR FROM PRENOTAZIONE WHERE ID_ISTR=? AND DATA =? AND ORARIO=?", Statement.RETURN_GENERATED_KEYS);
            s.setString(1, id_istr);
            s.setString(2, giorno_pren);
            s.setString(3, orario_pren);
            ResultSet rs = s.executeQuery();

            //Se il result set ha un risultato non vuoto, per assicurarmi di non sbagliare confronto di 
            // nuovo gli id e se sono uguali torna falso, altrimenti tornerà vero
            if(rs.next()) {
                if(id_istr.equals(rs.getString(1))) {
                    return false;
                }
            }
            return true;
        }
        catch(SQLException e) {
            System.out.println("Errore accesso al db prenotazione \n" + e);
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
        
    //Metodo che ritorna la lista delle prenotazioni dell'istruttore per "oggi" (parametro passato)
    public static List<String> get_occup_today_istr(LocalDate today) {

        java.sql.Connection conn = DBManager.getInstance().getConnection();
		PreparedStatement s = null;

        try {
            
            s = conn.prepareStatement("SELECT * FROM PRENOTAZIONE WHERE DATA=?", Statement.RETURN_GENERATED_KEYS);

            String tod = today.toString();
            s.setString(1, tod);
            boolean flag = true;

            ResultSet rs = s.executeQuery();

            List<String> mypren = new ArrayList<String>();

            while(rs.next()) {
            	
                String id_istr = new String();
                id_istr = rs.getString(4);
                
                for(int i=0; i<mypren.size();i++) {
                	if((id_istr.equals(mypren.get(i)))) {
                		flag=false;
                	}
                }
                if(flag==true) {
                	mypren.add(id_istr);
                }
                flag=true;
               
            }
            return mypren;
        }
        catch(SQLException e) {
            System.out.println("Errore accesso al db prenotazione \n" + e);
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

    //Metodo che ritorna la lista delle prenotazioni di un singolo istruttore per "oggi"
    public static List<String> get_orari_istr(LocalDate today, String id_istr ) {

        java.sql.Connection conn = DBManager.getInstance().getConnection();
		PreparedStatement s = null;

        try {
            
            s = conn.prepareStatement("SELECT * FROM PRENOTAZIONE WHERE DATA=? AND ID_ISTR =?", Statement.RETURN_GENERATED_KEYS);

            String tod = today.toString();
            s.setString(1, tod);
            s.setString(2, id_istr);
           

            ResultSet rs = s.executeQuery();

            List<String> orari = new ArrayList<String>();

            while(rs.next()) {
                orari.add(rs.getString(1));
            }
            return orari;
        }
        catch(SQLException e) {
            System.out.println("Errore accesso al db prenotazione \n" + e);
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

    public static String get_client_istr(LocalDate today, String id_istr, String orario ) {

        java.sql.Connection conn = DBManager.getInstance().getConnection();
		PreparedStatement s = null;

        try {
            
            s = conn.prepareStatement("SELECT * FROM PRENOTAZIONE WHERE DATA=? AND ID_ISTR =? AND ORARIO =?", Statement.RETURN_GENERATED_KEYS);

            String tod = today.toString();
            s.setString(1, tod);
            s.setString(2, id_istr);
            s.setString(3, orario);
            

            ResultSet rs = s.executeQuery();
            String orari = new String();
            
            rs.next();
            orari=rs.getString(3);
            return orari;
        }
        catch(SQLException e) {
            System.out.println("Errore accesso al db prenotazione \n" + e);
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
    
    //Metodo che ritorna la lista delle prenotazioni di un singolo cliente per "oggi"
    public static List<String> get_orari_client(LocalDate today, String user_cl )  {

        java.sql.Connection conn = DBManager.getInstance().getConnection();
		PreparedStatement s = null;

        try {
            
            s = conn.prepareStatement("SELECT * FROM PRENOTAZIONE WHERE DATA=? AND USERNAME_CLIENT =?", Statement.RETURN_GENERATED_KEYS);

            String tod = today.toString();
            s.setString(1, tod);
            s.setString(2, user_cl);
           

            ResultSet rs = s.executeQuery();

            List<String> orari = new ArrayList<String>();

            while(rs.next()) {
                orari.add(rs.getString(1));
            }
            return orari;
        }
        catch(SQLException e) {
            System.out.println("Errore accesso al db prenotazione \n" + e);
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

    public static String get_istr_client(LocalDate today, String user_cli, String orario )  {

        java.sql.Connection conn = DBManager.getInstance().getConnection();
		PreparedStatement s = null;

        try {
            
            s = conn.prepareStatement("SELECT * FROM PRENOTAZIONE WHERE DATA=? AND USURNAME_CLIENT =? AND ORARIO =?", Statement.RETURN_GENERATED_KEYS);

            String tod = today.toString();
            s.setString(1, tod);
            s.setString(2, user_cli);
            s.setString(3, orario);
            

            ResultSet rs = s.executeQuery();
            String orari = new String();
            
            rs.next();
            orari=rs.getString(4);
            return orari;
        }
        catch(SQLException e) {
            System.out.println("Errore accesso al db prenotazione \n" + e);
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
