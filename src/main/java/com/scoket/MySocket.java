package com.scoket;

import org.springframework.stereotype.Component;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.concurrent.CopyOnWriteArraySet;

@ServerEndpoint("/websocket")
@Component
public class MySocket {

        private static int onlineCount = 0;

        private static CopyOnWriteArraySet<MySocket> player = new CopyOnWriteArraySet<MySocket>();

        private static CopyOnWriteArraySet<MySocket> audience = new CopyOnWriteArraySet<MySocket>();

        private Session session;

        @OnOpen
        public void onOpen (Session session){
            this.session = session;
            if (player.size() < 2)
                player.add(this);
            else
                audience.add(this);
            addOnlineCount();
            System.out.println("有新链接加入!当前在线人数为" + getOnlineCount());
        }

        @OnClose
        public void onClose (Session session){
            player.remove(this);
            subOnlineCount();
            System.out.println("有一链接关闭!当前在线人数为" + getOnlineCount());
        }

        @OnMessage
        public void onMessage (String message, Session session) throws IOException {
            System.out.println("来自客户端的消息:" + message);
            // 群发消息
            for ( MySocket item : player ){
                item.sendMessage(message);
            }
        }

        public void sendMessage (String message) throws IOException {
            this.session.getBasicRemote().sendText(message);
        }

        public static synchronized  int getOnlineCount (){
            return MySocket.onlineCount;
        }

        public static synchronized void addOnlineCount (){
            MySocket.onlineCount++;
        }

        public static synchronized void subOnlineCount (){
            MySocket.onlineCount--;
        }

}
