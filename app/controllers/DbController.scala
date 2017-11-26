package controllers

import java.text.SimpleDateFormat
import java.util.Calendar
import javax.inject.{Inject, Singleton}

import models.Order.{Order, orderForm}
import models.OrderElement.{OrderElement, orderElementForm}
import play.api.db.Database
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{AbstractController, AnyContent, ControllerComponents}

import scala.collection.mutable.ListBuffer

@Singleton
class DbController @Inject()(db: Database, cc: ControllerComponents) extends AbstractController(cc) {

  def getAllOrders = Action {
    val connection = db.getConnection()
    try {
      var statementOrders = connection.createStatement
      var ordersList = new ListBuffer[Order]()
      val orders = statementOrders.executeQuery("SELECT * FROM orders ORDER BY id ASC")
      while (orders.next()) {
        statementOrders = connection.createStatement
        val id = orders.getString("id")
        val date = orders.getString("date").replace(".0", "")
        val order = orderForm.bind(Map("id" -> id, "date" -> date)).get
        ordersList += order
      }
      val dataJson = Json.obj("orders" -> ordersList.toList)
      Ok(dataJson)
    } finally {
      connection.close()
    }
  }

  def getElementsByOrderId(id: Long) = Action {
    val connection = db.getConnection()
    try {
      var statement = connection.createStatement
      val ordersElements = statement.executeQuery("SELECT * FROM orderelements WHERE orderId='" + id + "'")
      var orderElementsList = new ListBuffer[OrderElement]()
      while (ordersElements.next()) {
        statement = connection.createStatement
        val name = ordersElements.getString("name")
        val age = ordersElements.getString("age")
        val statementProduct = connection.createStatement
        val product = statementProduct.executeQuery("SELECT * FROM store WHERE id='" + ordersElements.getString("productId") + "'")
        if (product.next()) {
          val orderElement = orderElementForm.bind(Map("name" -> name, "age" -> age, "color" -> product.getString("color"), "size" -> product.getString("size"))).get
          orderElementsList += orderElement
        }
      }
      val dataJson = Json.obj("elements" -> orderElementsList.toList)
      Ok(dataJson)
    } finally {
      connection.close()
    }
  }

  def getProduct(color: String, size: String) = Action {
    val connection = db.getConnection()
    try {
      val statement = connection.createStatement
      val products = statement.executeQuery("SELECT * FROM store WHERE color='" + color + "' AND size='" + size + "'")
      if (products.next()) {
        val id = products.getString("id")
        val quantity = products.getString("quantity")
        val dataJson = Json.obj("id" -> id, "quantity" -> quantity)
        Ok(dataJson)
      }else{
        BadRequest("noProductsInDb")
      }
    } finally {
      connection.close()
    }
  }

  def decreaseProductQuantity(id: Long) = Action {
    val connection = db.getConnection()
    try {
      val statement = connection.createStatement
      statement.executeUpdate("UPDATE store SET quantity = quantity-1 WHERE id='" + id + "'")
      Ok("Ok!")
    } finally {
      connection.close()
    }
  }

  def increaseProductQuantity(id: Long) = Action {
    val connection = db.getConnection()
    try {
      val statement = connection.createStatement
      statement.executeUpdate("UPDATE store SET quantity = quantity+1 WHERE id='" + id + "'")
      Ok("Ok!")
    } finally {
      connection.close()
    }
  }

  def addOrder = Action { request =>
    val body: AnyContent = request.body
    val jsonBody: Option[JsValue] = body.asJson
    val connection = db.getConnection()
    try {
      val statement = connection.createStatement
      var correctElements = 0
      var orderID = 0
      jsonBody.foreach { json =>
        val elements = json.as[Seq[OrderElement]]
        val lastOrder = statement.executeQuery("SELECT * FROM orders ORDER BY id DESC LIMIT 1")
        if (lastOrder.next()) {
          orderID = lastOrder.getInt("id") + 1
        }
        for (element <- elements) {
          val product = statement.executeQuery("SELECT * FROM store WHERE color='" + element.color + "' AND size='" + element.size + "'")
          var productID = 0
          var productQuantity = 0
          if (product.next()) {
            productID = product.getInt("id")
            productQuantity = product.getInt("quantity")
          }
          if (productQuantity != 0) {
            correctElements += 1
            statement.executeUpdate("INSERT INTO orderelements VALUES(null, '" + element.name + "', '" + element.age + "', '" + productID + "', '" + orderID + "')")
          }
        }
      }
      if (correctElements != 0) {
        val format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
        statement.executeUpdate("INSERT INTO orders VALUES('" + orderID + "', '" + format.format(Calendar.getInstance().getTime()) + "')")
        Ok("ok")
      } else {
        Ok("noProductsInDb")
      }
    } finally {
      connection.close()
    }
  }

}