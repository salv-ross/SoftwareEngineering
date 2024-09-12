package DB;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.PreparedStatement;
import Entity.Simulazione;
import java.sql.ResultSet;
import java.lang.Math;

public class DomandaDAO {

    final static int NUM_DOMANDE = 40;
    
    //Prende casualmente 40 domande e le inserisce in un oggetto simulazione
    public static Simulazione get_domande()  {
        java.sql.Connection conn = DBManager.getInstance().getConnection();
		PreparedStatement s = null;

        try { 
            s = conn.prepareStatement("SELECT * FROM DOMANDA", Statement.RETURN_GENERATED_KEYS); 
            ResultSet quest = s.executeQuery();

            Entity.Domanda[] quest_list = new Entity.Domanda[NUM_DOMANDE];
            for(int i=0; i<NUM_DOMANDE; i++) {
                quest_list[i]= new Entity.Domanda("0","0","0");
            }
            
            int indice = (int) (Math.random() * (100 - 1) + 1);
            	
            for(int i=0; i<NUM_DOMANDE; i++) {
                indice = indice + (int) (Math.random() * (10-1) +1);
                System.out.println("indice: "+indice);
                quest.absolute(indice);
                quest_list[i].testo = quest.getString(1);
                quest_list[i].risposta = quest.getString(2);
                quest_list[i].immagine = quest.getString(3);
            }
            Entity.Simulazione new_sim = new Entity.Simulazione(quest_list);
            return new_sim;
        }

        catch(SQLException e) {
            System.out.println("Errore nel database \n" +e);
            return null;
        }
    }

}
