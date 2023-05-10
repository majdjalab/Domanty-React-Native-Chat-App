import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Platform, KeyboardAvoidingView, Image, TouchableOpacity, StyleSheet, Text, ImageBackground, SafeAreaView} from 'react-native';
import { GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import { database, auth } from '../config/firebase';
import { useNavigation } from '@react-navigation/native'
import { ref, onValue, push } from 'firebase/database';
import * as ImagePicker from 'expo-image-picker';

const Chat = ({ route }) => {
  const { selectedUser } = route.params;
  const [messages, setMessages] = useState([]);

   //Delete the title on the top of the screen 
 const navigation = useNavigation();
 useLayoutEffect(() => {
 navigation.setOptions({
     headerShown:false,
 });
 }, []);

  useEffect(() => {
    const chatroomId = getChatroomId(selectedUser.uid);
    const getMessagesRef = ref(database, `chatrooms/${chatroomId}/messages`);
    onValue(getMessagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageArray = Object.keys(data).map((key) => ({
          _id: key,
          ...data[key],
          user: {
            _id: data[key].user.uid,
            name: data[key].user.username,
          },
        }));
        setMessages(messageArray.reverse());
      } else {
        setMessages([]);
      }
    });
  }, []);

  const getChatroomId = (uid) => {
    const currentUserUid = auth.currentUser.uid;
    const chatroomId =
      uid < currentUserUid
        ? `${uid}-${currentUserUid}`
        : `${currentUserUid}-${uid}`;
    return chatroomId;
  };

 const onSend = async (newMessages = []) => {
  const chatroomId = getChatroomId(selectedUser.uid);
  const newMessage = newMessages[0];
  await push(ref(database, `chatrooms/${chatroomId}/messages`), {
    ...newMessage,
    user: {
      uid: auth.currentUser.uid,
      username: selectedUser.username,
    },
  });
  setMessages(GiftedChat.append(messages, newMessages));
};


  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newMessage = [
        {
          _id: Math.random().toString(),
          image: result.uri,
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'You',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
      ];
      onSend(newMessage);
    }
  }
function MyInputToolbar(props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: '#333',
          marginHorizontal: 20,
          borderRadius: 15,
          borderTopColor: '#333',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        textInputStyle={{ color: 'white' }}
        renderSend={(props) => <MySend {...props} />}
      />
    </View>
  );
}

 function MySend(props) {
    return (
      <View style={{alignContent:'center', alignItems:'center', flexDirection:'row'}}>
          {/* Render a TouchableOpacity component that, when pressed, sets the modalVisible variable to true */}
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={require("../assets/attachFile.png")}
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>
          <View
            style={{
              borderLeftColor: "#2E86C1",
              borderLeftWidth: 1,
              height: "100%",
              marginLeft:15,
              paddingVertical:15
            }}
          />
        <Send {...props}>
        <View>
          <Image
              source={require("../assets/send.png")}
              style={{ width: 25, height: 25 }}
            />
        </View>
      </Send>
        </View>
    );
  }


  // Function to render the chat header
  const renderHeader = () => {
    return (
      <SafeAreaView
        style={{
          backgroundColor: "#333",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 40,
          marginHorizontal: 25,
          borderRadius: 15,
          paddingVertical: 5,
        }}
      >
        <TouchableOpacity style={{ position: "absolute", left: 15 }}
        onPress={() => navigation.navigate('Home')}>
          <Image
            source={require("../assets/back.png")}
            style={{ width: 25, height: 25, borderRadius: 10 }}
          />
        </TouchableOpacity>
        <Image
          source={require('../assets/user.png')}
          style={{ width: 40, height: 40, borderRadius: 20, left: 60 }}
        />
        <Text
          style={{
            color: "#2E86C1",
            fontSize: 18,
            left: 70,
            fontWeight: "bold",
          }}
        >
          Chat Title
        </Text>
      </SafeAreaView>
    );
  };
  return (
    <ImageBackground
      source={require("../assets/chatRoomBg.png")}
      style={{ flex: 1, backgroundColor: "#222" }}
    >
    {renderHeader()}
      <GiftedChat
        messages={messages}
        alwaysShowSend 
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: auth.currentUser.uid,
          name: auth.currentUser.displayName,
        }}
        keyExtractor={(message) => message._id}
        renderInputToolbar={(props) => <MyInputToolbar {...props} />}
        messagesContainerStyle={{ paddingBottom: 60 }}
      />
      {Platform.OS === 'android' && <KeyboardAvoidingView behavior="height" />}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "85%",
    height: "30%",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  button: {
    backgroundColor: "#222",
    width: 120,
    height: 120,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    borderWidth:1,
    borderColor:'#2E86C1'
  },
  buttonText: {
    color: "#2E86C1",
    marginTop: 10,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#222",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth:1,
    borderColor:'#2E86C1'
  },
});


export default Chat;
