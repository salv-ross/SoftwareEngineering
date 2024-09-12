package DB;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
// TO-DO: GUARDA RIGA 50
/*
 * Gestisce la logica di connessione al DBMS.
 *
 * Implementa il pattern sigleton:
 * 	- Il costruttore e' privato
 *  - C'e' un metodo static public getInstance() che restistuisce un riferimento all'unica istanza
 *      dell'oggetto.
 *      
 * 
 */
class DBManager {
	
	private DBManager()  {
	}
	
	private static DBManager instance = null;
	
	public static DBManager getInstance()  {
		if (instance == null) {
			try {
				Class.forName("org.h2.Driver");
			} catch (ClassNotFoundException e) {
				throw new RuntimeException("Impossibile to load the DBManager!", e);
			}
			instance = new DBManager(); 
		}
		return instance;
	}
	
	public Connection getConnection() {
		try
		{if (connection == null || connection.isClosed()) {
			//final String pathDB_H2 = "./test";
			this.connection = DriverManager.getConnection("jdbc:h2:" + dbPath ,"admin","");
		}
		return connection;	
	}
		
		catch(SQLException e) {
		System.out.println("ERRRORE CONNESSIONE  \n" +e);
		return null;
		}
	
}
	
	public void closeConnection()  {
		try
		{
			if (connection != null && !connection.isClosed()) {
		
			connection.close();
		}
		}
		catch(SQLException e) {
			System.out.println("ERRRORE CONNESSIONE  \n" +e);
			}
	}
	
	protected Connection connection;
	//TO-DO: CAMBIARE PATH DB
	protected final String dbPath = "tcp://localhost/~/test";
}
